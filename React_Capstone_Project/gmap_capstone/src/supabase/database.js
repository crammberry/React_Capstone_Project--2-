import { supabase } from './config'

// Plot Management Functions
export const plotService = {
  // Get all plots
  async getAllPlots() {
    try {
      const { data, error } = await supabase
        .from('plots')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching plots:', error)
      return []
    }
  },

  // Get plots by section
  async getPlotsBySection(sectionId) {
    try {
      const { data, error } = await supabase
        .from('plots')
        .select('*')
        .eq('section', sectionId)
        .order('plot_number', { ascending: true })
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching plots by section:', error)
      return []
    }
  },

  // Get single plot
  async getPlot(plotId) {
    try {
      const { data, error } = await supabase
        .from('plots')
        .select('*')
        .eq('id', plotId)
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching plot:', error)
      return null
    }
  },

  // Create new plot
  async createPlot(plotData) {
    try {
      const { data, error } = await supabase
        .from('plots')
        .insert([plotData])
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating plot:', error)
      return null
    }
  },

  // Update plot
  async updatePlot(plotId, updateData) {
    try {
      const { data, error } = await supabase
        .from('plots')
        .update(updateData)
        .eq('id', plotId)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating plot:', error)
      return null
    }
  },

  // Delete plot
  async deletePlot(plotId) {
    try {
      const { error } = await supabase
        .from('plots')
        .delete()
        .eq('id', plotId)
      
      if (error) throw error
      return true
    } catch (error) {
      console.error('Error deleting plot:', error)
      return false
    }
  },

  // Real-time listener for plots
  onPlotsChange(callback) {
    const subscription = supabase
      .channel('plots_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'plots' }, 
        callback
      )
      .subscribe()
    
    return () => {
      subscription.unsubscribe()
    }
  },

  // Get plot statistics
  async getPlotStats() {
    try {
      const { data, error } = await supabase
        .from('plots')
        .select('status')
      
      if (error) throw error
      
      const stats = {
        total: data.length,
        available: data.filter(p => p.status === 'available').length,
        occupied: data.filter(p => p.status === 'occupied').length,
        reserved: data.filter(p => p.status === 'reserved').length
      }
      
      return stats
    } catch (error) {
      console.error('Error fetching plot stats:', error)
      return { total: 0, available: 0, occupied: 0, reserved: 0 }
    }
  }
}

// Reservation Management Functions
export const reservationService = {
  // Get all reservations
  async getAllReservations() {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching reservations:', error)
      return []
    }
  },

  // Create reservation
  async createReservation(reservationData) {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .insert([reservationData])
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating reservation:', error)
      return null
    }
  },

  // Update reservation
  async updateReservation(reservationId, updateData) {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .update(updateData)
        .eq('id', reservationId)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating reservation:', error)
      return null
    }
  },

  // Delete reservation
  async deleteReservation(reservationId) {
    try {
      const { error } = await supabase
        .from('reservations')
        .delete()
        .eq('id', reservationId)
      
      if (error) throw error
      return true
    } catch (error) {
      console.error('Error deleting reservation:', error)
      return false
    }
  }
}

// Section Management Functions
export const sectionService = {
  // Get all sections
  async getAllSections() {
    try {
      const { data, error } = await supabase
        .from('sections')
        .select('*')
        .order('name', { ascending: true })
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching sections:', error)
      return []
    }
  },

  // Create section
  async createSection(sectionData) {
    try {
      const { data, error } = await supabase
        .from('sections')
        .insert([sectionData])
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating section:', error)
      return null
    }
  }
}



