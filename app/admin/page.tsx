"use client"

import { useState, useMemo, useEffect } from "react"
import { fetchPortfolioSubmissions, updateMultipleSelections, deletePortfolioSubmission, updateSubmissionSelection } from "@/lib/supabase"
import ProtectedAdminPage from "@/components/ProtectedAdminPage"
import { useAuth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Shuffle,
  ChevronLeft,
  ChevronRight,
  Copy,
  X,
  Trash2,
} from "lucide-react"
import Image from "next/image"

// Transform Supabase data to match dashboard format
function transformSubmission(submission: any) {
  return {
    id: submission.id,
    name: submission.full_name,
    email: submission.email,
    linkedin: submission.linkedin_url || "",
    portfolioLink: submission.portfolio_url,
    roleType: submission.design_focus,
    seeking: submission.opportunities,
    location: submission.location || "",
    bio: submission.bio || "",
    submissionDate: submission.created_at.split('T')[0], // Convert to YYYY-MM-DD format
    selected: submission.selected_date,
  }
}

type SortField = "name" | "location" | "roleType" | "seeking" | "submissionDate"
type SortDirection = "asc" | "desc" | null

type TransformedSubmission = {
  id: string
  name: string
  email: string
  linkedin: string
  portfolioLink: string
  roleType: string
  seeking: string
  location: string
  bio: string
  submissionDate: string
  selected: string | null
}

function AdminDashboardContent() {
  const { logout } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<SortField | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [submissions, setSubmissions] = useState<TransformedSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [randomSelections, setRandomSelections] = useState<TransformedSubmission[]>([])
  const [showEntryModal, setShowEntryModal] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<TransformedSubmission | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const [checkedSubmissions, setCheckedSubmissions] = useState<Set<string>>(new Set())
  const itemsPerPage = 25

  // Fetch submissions from Supabase on component mount
  useEffect(() => {
    async function loadSubmissions() {
      setLoading(true)
      try {
        const data = await fetchPortfolioSubmissions()
        const transformedData = data.map(transformSubmission)
        setSubmissions(transformedData)
        
        // Initialize checked submissions based on existing selected_date
        const initialChecked = new Set(transformedData.filter(sub => sub.selected).map(sub => sub.id))
        setCheckedSubmissions(initialChecked)
      } catch (error) {
        console.error('Failed to load submissions:', error)
      } finally {
        setLoading(false)
      }
    }

    loadSubmissions()
  }, [])

  const filteredAndSortedData = useMemo(() => {
    let filtered = submissions.filter(
      (submission) =>
        submission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.roleType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getDesignFocusDisplay(submission.roleType).toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.seeking.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getOpportunitiesDisplay(submission.seeking).toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.bio.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    // Filter by tab
    if (activeTab === "new") {
      filtered = filtered.filter(submission => !checkedSubmissions.has(submission.id))
    } else if (activeTab === "selected") {
      filtered = filtered.filter(submission => checkedSubmissions.has(submission.id))
    }
    // "all" tab shows everything (no additional filter)

    if (sortField && sortDirection) {
      filtered.sort((a, b) => {
        const aValue = a[sortField]
        const bValue = b[sortField]

        if (sortDirection === "asc") {
          return aValue.localeCompare(bValue)
        } else {
          return bValue.localeCompare(aValue)
        }
      })
    }

    return filtered
  }, [submissions, searchTerm, sortField, sortDirection, activeTab, checkedSubmissions])

  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage)
  const paginatedData = filteredAndSortedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === "asc") {
        setSortDirection("desc")
      } else if (sortDirection === "desc") {
        setSortField(null)
        setSortDirection(null)
      } else {
        setSortDirection("asc")
      }
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
    setCurrentPage(1) // Reset to first page when sorting
  }

  const pickRandomFive = () => {
    const shuffled = [...filteredAndSortedData].sort(() => 0.5 - Math.random())
    const randomFive = shuffled.slice(0, 5)
    setRandomSelections(randomFive)
    setShowModal(true)
  }

  const handleCopyAndClose = async () => {
    const currentDate = new Date().toISOString().split("T")[0]
    
    // Update selections in Supabase
    const selectedIds = randomSelections.map(selection => selection.id)
    await updateMultipleSelections(selectedIds, currentDate)
    
    // Update local state
    const updatedSubmissions = submissions.map((submission) => {
      if (randomSelections.some((selected) => selected.id === submission.id)) {
        return { ...submission, selected: currentDate }
      }
      return submission
    })
    setSubmissions(updatedSubmissions)
    
    // Update checkbox state to check the selected submissions
    const newCheckedSubmissions = new Set(checkedSubmissions)
    selectedIds.forEach(id => newCheckedSubmissions.add(id))
    setCheckedSubmissions(newCheckedSubmissions)

    const copyText = randomSelections
      .map(
        (person, index) =>
          `${index + 1}. ${person.name}\nPortfolio: ${person.portfolioLink}\nLocation: ${person.location}\nFocus: ${getDesignFocusDisplay(person.roleType)}\nSeeking: ${getOpportunitiesDisplay(person.seeking)}`,
      )
      .join("\n\n")

    navigator.clipboard.writeText(copyText)
    setShowModal(false)
  }

  const handleRowClick = (submission: TransformedSubmission) => {
    setSelectedEntry(submission)
    setShowEntryModal(true)
  }

  const handleCheckboxChange = async (submissionId: string, checked: boolean) => {
    const newCheckedSubmissions = new Set(checkedSubmissions)
    
    if (checked) {
      newCheckedSubmissions.add(submissionId)
      // Update database with selected status
      await updateSubmissionSelection(submissionId, new Date().toISOString().split('T')[0])
    } else {
      newCheckedSubmissions.delete(submissionId)
      // Remove selected status from database
      await updateSubmissionSelection(submissionId, null)
    }
    
    setCheckedSubmissions(newCheckedSubmissions)
    
    // Update the submissions state to reflect the change
    setSubmissions(prev => prev.map(sub => 
      sub.id === submissionId 
        ? { ...sub, selected: checked ? new Date().toISOString().split('T')[0] : null }
        : sub
    ))
  }

  const handleDeleteSubmission = async (submissionId: string, event: React.MouseEvent) => {
    event.stopPropagation() // Prevent row click
    
    if (confirm('Are you sure you want to delete this submission? This action cannot be undone.')) {
      try {
        const result = await deletePortfolioSubmission(submissionId)
        if (result.success) {
          // Remove from local state
          setSubmissions(prev => prev.filter(sub => sub.id !== submissionId))
          setCheckedSubmissions(prev => {
            const newSet = new Set(prev)
            newSet.delete(submissionId)
            return newSet
          })
        } else {
          alert('Failed to delete submission. Please try again.')
        }
      } catch (error) {
        console.error('Delete error:', error)
        alert('Failed to delete submission. Please try again.')
      }
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="w-4 h-4" />
    if (sortDirection === "asc") return <ArrowUp className="w-4 h-4" />
    if (sortDirection === "desc") return <ArrowDown className="w-4 h-4" />
    return <ArrowUpDown className="w-4 h-4" />
  }

  const getSeekingBadgeVariant = (seeking: string) => {
    switch (seeking.toLowerCase()) {
      case "full-time":
        return "default" // Blue
      case "freelance":
        return "secondary" // Green
      case "contract":
        return "outline" // Orange
      case "remote":
        return "destructive" // Purple
      case "feedback":
        return "secondary" // Teal
      default:
        return "default"
    }
  }

  const getSeekingBadgeClass = (seeking: string) => {
    switch (seeking.toLowerCase()) {
      case "full-time":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200"
      case "freelance":
        return "bg-green-100 text-green-800 hover:bg-green-200"
      case "collaboration":
        return "bg-orange-100 text-orange-800 hover:bg-orange-200"
      case "portfolio-flex":
        return "bg-purple-100 text-purple-800 hover:bg-purple-200"
      case "feedback":
        return "bg-teal-100 text-teal-800 hover:bg-teal-200"
      case "networking":
        return "bg-pink-100 text-pink-800 hover:bg-pink-200"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    }
  }

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + "..."
  }

  // Map form values to display text
  const getDesignFocusDisplay = (value: string) => {
    const mapping: { [key: string]: string } = {
      "ui-ux": "UI/UX Design",
      "graphic": "Graphic Design", 
      "branding": "Branding",
      "illustration": "Illustration",
      "web": "Web Design",
      "mobile": "Mobile App Design",
      "product": "Product Design",
      "motion": "Motion Graphics",
      "other": "Other"
    }
    return mapping[value] || value
  }

  const getOpportunitiesDisplay = (value: string) => {
    const mapping: { [key: string]: string } = {
      "freelance": "Freelance Projects",
      "full-time": "Full-time Positions", 
      "collaboration": "Design Collaborations",
      "portfolio-flex": "Just Flexing My Portfolio",
      "feedback": "Looking for Feedback",
      "networking": "Networking & Community"
    }
    return mapping[value] || value
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Image
              src="/notnormal_logo.jpg"
              alt="NotNormal.io"
              width={40}
              height={40}
              className="rounded-lg"
            />
            <h1 className="text-2xl font-bold text-foreground">Admin</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={logout}>Sign Out</Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Form Submissions</CardTitle>

            {/* Search and Actions */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search submissions..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setCurrentPage(1) // Reset to first page when searching
                  }}
                  className="pl-10"
                />
              </div>
              <Button onClick={pickRandomFive} variant="outline" className="flex items-center gap-2 bg-transparent">
                <Shuffle className="w-4 h-4" />
                Pick 5 at Random
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            {/* Loading State */}
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-2">Loading submissions...</p>
              </div>
            ) : (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="new">New ({submissions.filter(s => !checkedSubmissions.has(s.id)).length})</TabsTrigger>
                  <TabsTrigger value="selected">Selected ({checkedSubmissions.size})</TabsTrigger>
                  <TabsTrigger value="all">All ({submissions.length})</TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="mt-6">
                  {/* Table */}
                  <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 w-10">
                      <span className="font-medium">Select</span>
                    </th>
                    <th className="text-left py-3 px-2">
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("name")}
                        className="h-auto p-0 font-medium flex items-center gap-1"
                      >
                        Name
                        {getSortIcon("name")}
                      </Button>
                    </th>
                    <th className="text-left py-3 px-2 hidden md:table-cell">
                      <span className="font-medium">Email</span>
                    </th>
                    <th className="text-left py-3 px-2 hidden sm:table-cell">
                      <span className="font-medium">LinkedIn</span>
                    </th>
                    <th className="text-left py-3 px-2 hidden lg:table-cell">
                      <span className="font-medium">Portfolio</span>
                    </th>
                    <th className="text-left py-3 px-2">
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("roleType")}
                        className="h-auto p-0 font-medium flex items-center gap-1"
                      >
                        Role Type
                        {getSortIcon("roleType")}
                      </Button>
                    </th>
                    <th className="text-left py-3 px-2">
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("seeking")}
                        className="h-auto p-0 font-medium flex items-center gap-1"
                      >
                        Seeking
                        {getSortIcon("seeking")}
                      </Button>
                    </th>
                    <th className="text-left py-3 px-2">
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("location")}
                        className="h-auto p-0 font-medium flex items-center gap-1"
                      >
                        Location
                        {getSortIcon("location")}
                      </Button>
                    </th>
                    <th className="text-left py-3 px-2 hidden xl:table-cell">
                      <span className="font-medium">Bio</span>
                    </th>
                    <th className="text-left py-3 px-2 hidden lg:table-cell">
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("submissionDate")}
                        className="h-auto p-0 font-medium flex items-center gap-1"
                      >
                        Submission Date
                        {getSortIcon("submissionDate")}
                      </Button>
                    </th>
                    <th className="text-left py-3 px-2 w-20">
                      <span className="font-medium">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((submission) => (
                    <tr
                      key={submission.id}
                      onClick={() => handleRowClick(submission)}
                      className={`border-b hover:bg-muted/50 transition-colors cursor-pointer ${
                        selectedIds.has(submission.id) ? "bg-primary/10 border-primary/20" : ""
                      }`}
                    >
                      <td className="py-3 px-2" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={checkedSubmissions.has(submission.id)}
                          onCheckedChange={(checked) => handleCheckboxChange(submission.id, checked as boolean)}
                        />
                      </td>
                      <td className="py-3 px-2 font-medium text-sm">{submission.name}</td>
                      <td className="py-3 px-2 text-sm text-muted-foreground hidden md:table-cell">
                        {submission.email}
                      </td>
                      <td className="py-3 px-2 hidden sm:table-cell">
                        <a
                          href={submission.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          LinkedIn
                        </a>
                      </td>
                      <td className="py-3 px-2 hidden lg:table-cell">
                        <a
                          href={submission.portfolioLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline text-sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          View
                        </a>
                      </td>
                      <td className="py-3 px-2 text-sm">
                        <div className="truncate max-w-[120px]" title={getDesignFocusDisplay(submission.roleType)}>
                          {getDesignFocusDisplay(submission.roleType)}
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <Badge className={`text-xs ${getSeekingBadgeClass(submission.seeking)}`}>
                          {getOpportunitiesDisplay(submission.seeking)}
                        </Badge>
                      </td>
                      <td className="py-3 px-2 text-sm text-muted-foreground">{submission.location}</td>
                      <td className="py-3 px-2 text-sm text-muted-foreground hidden xl:table-cell max-w-xs">
                        <div className="truncate max-w-[200px]" title={submission.bio}>
                          {submission.bio}
                        </div>
                      </td>
                      <td className="py-3 px-2 text-sm text-muted-foreground hidden lg:table-cell">
                        {new Date(submission.submissionDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-2" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleDeleteSubmission(submission.id, e)}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredAndSortedData.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No submissions found matching your search.
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                  {Math.min(currentPage * itemsPerPage, filteredAndSortedData.length)} of {filteredAndSortedData.length}{" "}
                  entries
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Existing Random Selection Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="w-[95vw] min-w-[600px] max-w-4xl max-h-[90vh] overflow-y-auto overflow-x-hidden">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold">Random Selection - 5 Candidates</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {randomSelections.map((person, index) => (
              <div key={person.id} className="border rounded-lg p-6 bg-card">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-semibold">{person.name}</h3>
                  <Badge className={`${getSeekingBadgeClass(person.seeking)}`}>{getOpportunitiesDisplay(person.seeking)}</Badge>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Portfolio</p>
                    <a
                      href={person.portfolioLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-sm break-all"
                    >
                      {person.portfolioLink}
                    </a>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Location</p>
                    <p className="text-sm">{person.location}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Focus</p>
                    <p className="text-sm">{getDesignFocusDisplay(person.roleType)}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Email</p>
                    <p className="text-sm">{person.email}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Bio</p>
                  <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">{person.bio}</p>
                </div>

                <div className="text-xs text-muted-foreground">
                  Submitted: {new Date(person.submissionDate).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowModal(false)}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleCopyAndClose}>
              <Copy className="w-4 h-4 mr-2" />
              Copy & Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Single Entry Modal */}
      <Dialog open={showEntryModal} onOpenChange={setShowEntryModal}>
        <DialogContent className="w-[95vw] min-w-[600px] max-w-4xl max-h-[90vh] overflow-y-auto overflow-x-hidden">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold">{selectedEntry?.name}</DialogTitle>
          </DialogHeader>

          {selectedEntry && (
            <div className="space-y-6">
              <div className="border rounded-lg p-6 bg-card">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-semibold">{selectedEntry.name}</h3>
                  <Badge className={`${getSeekingBadgeClass(selectedEntry.seeking)}`}>{getOpportunitiesDisplay(selectedEntry.seeking)}</Badge>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Portfolio</p>
                    <a
                      href={selectedEntry.portfolioLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-sm break-all"
                    >
                      {selectedEntry.portfolioLink}
                    </a>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Location</p>
                    <p className="text-sm">{selectedEntry.location}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Focus</p>
                    <p className="text-sm">{getDesignFocusDisplay(selectedEntry.roleType)}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Email</p>
                    <p className="text-sm">{selectedEntry.email}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">LinkedIn</p>
                    <a
                      href={selectedEntry.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-sm"
                    >
                      View Profile
                    </a>
                  </div>


                </div>

                <div className="mb-4">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Bio</p>
                  <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">{selectedEntry.bio}</p>
                </div>

                <div className="text-xs text-muted-foreground">
                  Submitted: {new Date(selectedEntry.submissionDate).toLocaleDateString()}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEntryModal(false)}>
              <X className="w-4 h-4 mr-2" />
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function AdminDashboard() {
  return (
    <ProtectedAdminPage>
      <AdminDashboardContent />
    </ProtectedAdminPage>
  )
}
