import { createClient } from '@supabase/supabase-js'

// Create a single supabase client for interacting with your database
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_key'

// Only create client if we have valid environment variables
let supabase = null
try {
  if (supabaseUrl && supabaseKey && supabaseUrl !== 'https://placeholder.supabase.co') {
    supabase = createClient(supabaseUrl, supabaseKey)
  }
} catch (error) {
  console.warn('Supabase client initialization failed:', error)
}

export { supabase }

// Function to save portfolio submission to Supabase
export async function savePortfolioSubmission(formData) {
  if (!supabase) {
    console.warn('Supabase client not available')
    return { success: false, error: 'Supabase not configured' }
  }
  
  try {
    const { data, error } = await supabase
      .from('portfolio_submissions')
      .insert([
        {
          full_name: formData.fullName,
          email: formData.email,
          linkedin_url: formData.linkedin,
          location: formData.location,
          portfolio_url: formData.portfolioLink,
          design_focus: formData.designFocus,
          opportunities: formData.opportunities,
          bio: formData.bio,
          portfolio_file_name: formData.portfolioFile?.name || null,
          portfolio_file_size: formData.portfolioFile?.size || null
        }
      ])
      .select()

    if (error) {
      console.error('Supabase error:', error)
      return { success: false, error }
    }

    console.log('Saved to Supabase:', data)
    return { success: true, data }
  } catch (error) {
    console.error('Failed to save to Supabase:', error)
    return { success: false, error }
  }
}

// Function to fetch all portfolio submissions for admin dashboard
export async function fetchPortfolioSubmissions() {
  if (!supabase) {
    console.warn('Supabase client not available')
    return []
  }
  
  try {
    const { data, error } = await supabase
      .from('portfolio_submissions')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase fetch error:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Failed to fetch from Supabase:', error)
    return []
  }
}

// Function to update selected status for a submission
export async function updateSubmissionSelection(id, selectedDate) {
  if (!supabase) {
    console.warn('Supabase client not available')
    return { success: false, error: 'Supabase not configured' }
  }
  
  try {
    const { data, error } = await supabase
      .from('portfolio_submissions')
      .update({ selected_date: selectedDate })
      .eq('id', id)
      .select()

    if (error) {
      console.error('Supabase update error:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Failed to update Supabase:', error)
    return { success: false, error }
  }
}

// Function to update multiple submissions as selected (for Friday Five)
export async function updateMultipleSelections(ids, selectedDate) {
  if (!supabase) {
    console.warn('Supabase client not available')
    return { success: false, error: 'Supabase not configured' }
  }
  
  try {
    const { data, error } = await supabase
      .from('portfolio_submissions')
      .update({ selected_date: selectedDate })
      .in('id', ids)
      .select()

    if (error) {
      console.error('Supabase batch update error:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Failed to batch update Supabase:', error)
    return { success: false, error }
  }
}

// Function to delete a portfolio submission
export async function deletePortfolioSubmission(id) {
  if (!supabase) {
    console.warn('Supabase client not available')
    return { success: false, error: 'Supabase not configured' }
  }
  
  try {
    const { error } = await supabase
      .from('portfolio_submissions')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Supabase delete error:', error)
      return { success: false, error }
    }

    return { success: true }
  } catch (error) {
    console.error('Failed to delete from Supabase:', error)
    return { success: false, error }
  }
}
