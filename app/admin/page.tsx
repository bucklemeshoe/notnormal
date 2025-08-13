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
import { DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
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
  Eye,
  ExternalLink,
  Settings,
  Filter,
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
  
  // Initialize column visibility from localStorage or defaults
  const [visibleColumns, setVisibleColumns] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('admin-column-visibility')
      if (saved) {
        try {
          return JSON.parse(saved)
        } catch (error) {
          console.warn('Failed to parse saved column visibility:', error)
        }
      }
    }
    return {
      name: true,
      email: true,
      linkedin: true,
      portfolio: true,
      roleType: true,
      seeking: true,
      location: true,
      bio: true,
      submissionDate: true,
      actions: true,
    }
  })
  const itemsPerPage = 25

  // Save column visibility to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin-column-visibility', JSON.stringify(visibleColumns))
    }
  }, [visibleColumns])

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

  const toggleColumnVisibility = (column: keyof typeof visibleColumns) => {
    setVisibleColumns(prev => ({
      ...prev,
      [column]: !prev[column]
    }))
  }

  const setAllColumnsVisible = () => {
    setVisibleColumns({
      name: true,
      email: true,
      linkedin: true,
      portfolio: true,
      roleType: true,
      seeking: true,
      location: true,
      bio: true,
      submissionDate: true,
      actions: true,
    })
  }

  const setEssentialColumnsVisible = () => {
    setVisibleColumns({
      name: true,
      email: false,
      linkedin: false,
      portfolio: true,
      roleType: true,
      seeking: false,
      location: true,
      bio: false,
      submissionDate: true,
      actions: true,
    })
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
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={logout}>Sign Out</Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Page Heading */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">Admin</h1>
          <div className="h-px bg-border"></div>
        </div>
        
        <Card>
          <CardHeader className="pb-3">
            {/* Table Header: Title + Action Button */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex items-center gap-3">
                <CardTitle className="text-lg font-semibold">Form Submissions</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open('/', '_blank')}
                  className="p-2 h-auto text-muted-foreground hover:text-foreground"
                  title="View submission form"
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
              <Button onClick={pickRandomFive} variant="default" className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white">
                <Shuffle className="w-4 h-4" />
                Pick Random
              </Button>
            </div>
          </CardHeader>

          <CardContent>

            {/* Toolbar */}
            <div className="mb-6 p-4 bg-muted/50 rounded-lg border">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                {/* Left: Search */}
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search submissions..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value)
                      setCurrentPage(1) // Reset to first page when searching
                    }}
                    className="pl-10 bg-background"
                  />
                </div>

                {/* Center: Custom Tab Buttons */}
                <div className="flex-1 max-w-md">
                  <div className="inline-flex h-10 items-center justify-center rounded-md bg-background border p-1 text-muted-foreground shadow-sm">
                    <button
                      onClick={() => setActiveTab("new")}
                      className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
                        activeTab === "new" 
                          ? "bg-primary text-primary-foreground shadow-sm" 
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      New ({submissions.filter(s => !checkedSubmissions.has(s.id)).length})
                    </button>
                    <button
                      onClick={() => setActiveTab("selected")}
                      className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
                        activeTab === "selected" 
                          ? "bg-primary text-primary-foreground shadow-sm" 
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      Selected ({checkedSubmissions.size})
                    </button>
                    <button
                      onClick={() => setActiveTab("all")}
                      className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
                        activeTab === "all" 
                          ? "bg-primary text-primary-foreground shadow-sm" 
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      All ({submissions.length})
                    </button>
                  </div>
                </div>

                {/* Right: Column Filter Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="flex items-center gap-2 bg-background"
                    >
                      <Filter className="w-4 h-4" />
                      Columns
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Show/Hide Columns</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    
                    {/* Quick Actions */}
                    <div className="flex gap-1 p-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs flex-1"
                        onClick={setAllColumnsVisible}
                      >
                        Show All
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs flex-1"
                        onClick={setEssentialColumnsVisible}
                      >
                        Essential
                      </Button>
                    </div>
                    <DropdownMenuSeparator />
                    
                    {/* Column Checkboxes */}
                    <DropdownMenuCheckboxItem
                      checked={visibleColumns.name}
                      onCheckedChange={() => toggleColumnVisibility('name')}
                      onSelect={(e) => e.preventDefault()}
                    >
                      Name
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={visibleColumns.email}
                      onCheckedChange={() => toggleColumnVisibility('email')}
                      onSelect={(e) => e.preventDefault()}
                    >
                      Email
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={visibleColumns.linkedin}
                      onCheckedChange={() => toggleColumnVisibility('linkedin')}
                      onSelect={(e) => e.preventDefault()}
                    >
                      LinkedIn
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={visibleColumns.portfolio}
                      onCheckedChange={() => toggleColumnVisibility('portfolio')}
                      onSelect={(e) => e.preventDefault()}
                    >
                      Portfolio
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={visibleColumns.roleType}
                      onCheckedChange={() => toggleColumnVisibility('roleType')}
                      onSelect={(e) => e.preventDefault()}
                    >
                      Role Type
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={visibleColumns.seeking}
                      onCheckedChange={() => toggleColumnVisibility('seeking')}
                      onSelect={(e) => e.preventDefault()}
                    >
                      Seeking
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={visibleColumns.location}
                      onCheckedChange={() => toggleColumnVisibility('location')}
                      onSelect={(e) => e.preventDefault()}
                    >
                      Location
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={visibleColumns.bio}
                      onCheckedChange={() => toggleColumnVisibility('bio')}
                      onSelect={(e) => e.preventDefault()}
                    >
                      Bio
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={visibleColumns.submissionDate}
                      onCheckedChange={() => toggleColumnVisibility('submissionDate')}
                      onSelect={(e) => e.preventDefault()}
                    >
                      Date
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={visibleColumns.actions}
                      onCheckedChange={() => toggleColumnVisibility('actions')}
                      onSelect={(e) => e.preventDefault()}
                    >
                      Actions
                    </DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-2">Loading submissions...</p>
              </div>
            ) : (
              <div>
                  {/* Table */}
                  <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-center py-3 px-2 w-10">
                      <span className="font-medium text-sm">Select</span>
                    </th>
                    {visibleColumns.name && (
                      <th className="text-left py-3 px-2 w-32">
                        <Button
                          variant="ghost"
                          onClick={() => handleSort("name")}
                          className="h-auto p-0 font-medium text-sm flex items-center gap-1"
                        >
                          Name
                          {getSortIcon("name")}
                        </Button>
                      </th>
                    )}
                    {visibleColumns.email && (
                      <th className="text-left py-3 px-2 hidden md:table-cell">
                        <span className="font-medium text-sm">Email</span>
                      </th>
                    )}
                    {visibleColumns.linkedin && (
                      <th className="text-center py-3 px-2 hidden sm:table-cell">
                        <span className="font-medium text-sm">LinkedIn</span>
                      </th>
                    )}
                    {visibleColumns.portfolio && (
                      <th className="text-center py-3 px-2 hidden lg:table-cell">
                        <span className="font-medium text-sm">Portfolio</span>
                      </th>
                    )}
                    {visibleColumns.roleType && (
                      <th className="text-left py-3 px-2">
                        <Button
                          variant="ghost"
                          onClick={() => handleSort("roleType")}
                          className="h-auto p-0 font-medium text-sm flex items-center gap-1"
                        >
                          Role Type
                          {getSortIcon("roleType")}
                        </Button>
                      </th>
                    )}
                    {visibleColumns.seeking && (
                      <th className="text-left py-3 px-2">
                        <Button
                          variant="ghost"
                          onClick={() => handleSort("seeking")}
                          className="h-auto p-0 font-medium text-sm flex items-center gap-1"
                        >
                          Seeking
                          {getSortIcon("seeking")}
                        </Button>
                      </th>
                    )}
                    {visibleColumns.location && (
                      <th className="text-left py-3 px-2">
                        <Button
                          variant="ghost"
                          onClick={() => handleSort("location")}
                          className="h-auto p-0 font-medium text-sm flex items-center gap-1"
                        >
                          Location
                          {getSortIcon("location")}
                        </Button>
                      </th>
                    )}
                    {visibleColumns.bio && (
                      <th className="text-left py-3 px-2 hidden xl:table-cell">
                        <span className="font-medium text-sm">Bio</span>
                      </th>
                    )}
                    {visibleColumns.submissionDate && (
                      <th className="text-center py-3 px-2 hidden lg:table-cell">
                        <Button
                          variant="ghost"
                          onClick={() => handleSort("submissionDate")}
                          className="h-auto p-0 font-medium text-sm flex items-center gap-1 mx-auto"
                        >
                          Submission Date
                          {getSortIcon("submissionDate")}
                        </Button>
                      </th>
                    )}
                    {visibleColumns.actions && (
                      <th className="text-center py-3 px-2 w-20">
                        <span className="font-medium text-sm">Actions</span>
                      </th>
                    )}
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
                      <td className="py-3 px-2 text-center" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={checkedSubmissions.has(submission.id)}
                          onCheckedChange={(checked) => handleCheckboxChange(submission.id, checked as boolean)}
                        />
                      </td>
                      {visibleColumns.name && (
                        <td className="py-3 px-2 font-medium text-sm max-w-[128px] truncate">{submission.name}</td>
                      )}
                      {visibleColumns.email && (
                        <td className="py-3 px-2 text-sm text-muted-foreground hidden md:table-cell">
                          {submission.email}
                        </td>
                      )}
                      {visibleColumns.linkedin && (
                        <td className="py-3 px-2 hidden sm:table-cell text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="p-1 h-auto text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <a
                              href={submission.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                              </svg>
                            </a>
                          </Button>
                        </td>
                      )}
                      {visibleColumns.portfolio && (
                        <td className="py-3 px-2 hidden lg:table-cell text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="p-1 h-auto text-primary hover:text-primary/80 hover:bg-primary/10"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <a
                              href={submission.portfolioLink}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Eye className="w-4 h-4" />
                            </a>
                          </Button>
                        </td>
                      )}
                      {visibleColumns.roleType && (
                        <td className="py-3 px-2 text-sm">
                          <div className="truncate max-w-[120px]" title={getDesignFocusDisplay(submission.roleType)}>
                            {getDesignFocusDisplay(submission.roleType)}
                          </div>
                        </td>
                      )}
                      {visibleColumns.seeking && (
                        <td className="py-3 px-2">
                          <Badge className={`text-xs ${getSeekingBadgeClass(submission.seeking)}`}>
                            {getOpportunitiesDisplay(submission.seeking)}
                          </Badge>
                        </td>
                      )}
                      {visibleColumns.location && (
                        <td className="py-3 px-2 text-sm text-muted-foreground max-w-[120px] truncate" title={submission.location}>{submission.location}</td>
                      )}
                      {visibleColumns.bio && (
                        <td className="py-3 px-2 text-sm text-muted-foreground hidden xl:table-cell max-w-xs">
                          <div className="truncate max-w-[200px]" title={submission.bio}>
                            {submission.bio}
                          </div>
                        </td>
                      )}
                      {visibleColumns.submissionDate && (
                        <td className="py-3 px-2 text-sm text-muted-foreground text-center hidden lg:table-cell">
                          {new Date(submission.submissionDate).toLocaleDateString()}
                        </td>
                      )}
                      {visibleColumns.actions && (
                        <td className="py-3 px-2 text-center" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleDeleteSubmission(submission.id, e)}
                            className="text-red-600 hover:text-red-800 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      )}
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



              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
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
      </main>

      {/* Existing Random Selection Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="w-[98vw] min-w-[800px] max-w-6xl max-h-[95vh] overflow-y-auto p-6 pb-0">
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

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-4">
                  <div className="col-span-1 md:col-span-2 xl:col-span-1">
                    <p className="text-sm font-medium text-muted-foreground mb-1">Portfolio</p>
                    <a
                      href={person.portfolioLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-sm break-all block"
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

                  <div className="md:col-span-2 xl:col-span-1">
                    <p className="text-sm font-medium text-muted-foreground mb-1">Email</p>
                    <p className="text-sm break-all">{person.email}</p>
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

          <DialogFooter className="gap-2 mt-6 pt-4 pb-6 px-6 -mx-6 -mb-6 border-t sticky bottom-0 bg-background">
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
        <DialogContent className="w-[98vw] min-w-[800px] max-w-6xl max-h-[95vh] overflow-y-auto p-6 pb-0">
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

          <DialogFooter className="mt-6 pt-4 pb-6 px-6 -mx-6 -mb-6 border-t sticky bottom-0 bg-background">
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
