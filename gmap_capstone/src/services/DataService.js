import { supabase } from '../supabase/config';

// Central data service to replace all mock data generation
export class DataService {
  // Get all plots from database
  static async getAllPlots() {
    try {
      console.log('🔍 Attempting to fetch plots from database...');
      const { data, error } = await supabase
        .from('plots')
        .select('*')
        .order('section', { ascending: true })
        .order('level', { ascending: true })
        .order('plot_number', { ascending: true });
      
      if (error) {
        console.error('❌ Database error:', error);
        console.log('🔄 Database table may not exist, returning empty array');
        return [];
      }
      
      console.log('✅ Successfully fetched plots:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('❌ Error fetching plots:', error);
      console.log('🔄 Returning empty array as fallback');
      return [];
    }
  }

  // Get plots by section
  static async getPlotsBySection(sectionName) {
    try {
      const { data, error } = await supabase
        .from('plots')
        .select('*')
        .eq('section', sectionName)
        .order('level', { ascending: true })
        .order('plot_number', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching plots by section:', error);
      return [];
    }
  }

  // Get plot statistics
  static async getPlotStats() {
    try {
      const { data, error } = await supabase
        .from('plots')
        .select('status');
      
      if (error) throw error;
      
      const stats = {
        total: data.length,
        available: data.filter(p => p.status === 'available').length,
        occupied: data.filter(p => p.status === 'occupied').length,
        reserved: data.filter(p => p.status === 'reserved').length,
        exhumed: data.filter(p => p.status === 'exhumed').length
      };
      
      return stats;
    } catch (error) {
      console.error('Error fetching plot stats:', error);
      return { total: 0, available: 0, occupied: 0, reserved: 0, exhumed: 0 };
    }
  }

  // Search plots
  static async searchPlots(searchTerm) {
    try {
      const { data, error } = await supabase
        .from('plots')
        .select('*')
        .or(`occupant_name.ilike.%${searchTerm}%,plot_number.ilike.%${searchTerm}%,section.ilike.%${searchTerm}%,plot_id.ilike.%${searchTerm}%`)
        .order('section', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching plots:', error);
      return [];
    }
  }

  // Create new plot
  static async createPlot(plotData) {
    try {
      const { data, error } = await supabase
        .from('plots')
        .insert([plotData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating plot:', error);
      return null;
    }
  }


  // Delete plot
  static async deletePlot(plotId) {
    try {
      const { error } = await supabase
        .from('plots')
        .delete()
        .eq('id', plotId);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting plot:', error);
      return false;
    }
  }

  // Get single plot by ID
  static async getPlot(plotId) {
    try {
      console.log('DataService.getPlot called with plotId:', plotId);
      
      // Use maybeSingle() instead of single() to handle cases where plot doesn't exist
      const { data, error } = await supabase
        .from('plots')
        .select('*')
        .eq('plot_id', plotId)
        .maybeSingle();
      
      console.log('Database query result:', { data, error });
      
      // Handle specific error codes
      if (error) {
        // PGRST116 means no rows found - this is not an error, just return null
        if (error.code === 'PGRST116') {
          console.log(`ℹ️ Plot ${plotId} not found in database`);
          return null;
        }
        // For other errors, log and throw
        console.error('❌ Database error fetching plot:', error);
        throw error;
      }
      
      // If no data returned (plot doesn't exist)
      if (!data) {
        console.log(`ℹ️ Plot ${plotId} not found in database`);
        return null;
      }
      
      console.log(`✅ Successfully fetched plot ${plotId}`);
      return data;
    } catch (error) {
      console.error('❌ Error fetching plot:', error);
      return null;
    }
  }

  // Update plot
  static async updatePlot(plotId, updateData) {
    try {
      console.log('DataService.updatePlot called with:', { plotId, updateData });
      
      // First, let's check if the plot exists
      const { data: existingPlot, error: fetchError } = await supabase
        .from('plots')
        .select('*')
        .eq('plot_id', plotId)
        .single();
      
      console.log('Existing plot check:', { existingPlot, fetchError });
      
      if (fetchError) {
        console.error('Plot not found:', fetchError);
        throw new Error(`Plot ${plotId} not found in database`);
      }
      
      const updateFields = {
        occupant_name: updateData.name || '',
        age: updateData.age || null,
        cause_of_death: updateData.causeOfDeath || null,
        religion: updateData.religion || null,
        family_name: updateData.familyName || null,
        next_of_kin: updateData.nextOfKin || null,
        contact_number: updateData.contactNumber || null,
        date_of_interment: updateData.dateOfInterment || null,
        status: updateData.status || 'available',
        notes: updateData.notes || ''
      };
      
      const { data, error } = await supabase
        .from('plots')
        .update(updateFields)
        .eq('plot_id', plotId)
        .select()
        .single();
        
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating plot:', error);
      throw error;
    }
  }

  // EXHUMATION REQUEST METHODS

  // Create exhumation request
  static async createExhumationRequest(requestData) {
    try {
      console.log('DataService.createExhumationRequest called with:', requestData);
      
      const { data, error } = await supabase
        .from('exhumation_requests')
        .insert([requestData])
        .select()
        .single();
      
      console.log('Database response:', { data, error });
      
      if (error) {
        console.error('Database error:', error);
        throw new Error(`Database error: ${error.message}`);
      }
      
      return data;
    } catch (error) {
      console.error('Error creating exhumation request:', error);
      throw new Error(`Failed to create exhumation request: ${error.message}`);
    }
  }

  // Get all exhumation requests
  static async getExhumationRequests() {
    try {
      const { data, error } = await supabase
        .from('exhumation_requests')
        .select('*')
        .order('requested_date', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching exhumation requests:', error);
      return [];
    }
  }

  // Get exhumation request by ID
  static async getExhumationRequest(requestId) {
    try {
      const { data, error } = await supabase
        .from('exhumation_requests')
        .select('*')
        .eq('id', requestId)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching exhumation request:', error);
      return null;
    }
  }

  // Update exhumation request status
  static async updateExhumationRequestStatus(requestId, status, adminNotes = '', exhumationDate = null, exhumationTeam = '') {
    try {
      const updateData = {
        status,
        admin_notes: adminNotes,
        updated_at: new Date().toISOString()
      };

      if (exhumationDate) updateData.exhumation_date = exhumationDate;
      if (exhumationTeam) updateData.exhumation_team = exhumationTeam;

      const { data, error } = await supabase
        .from('exhumation_requests')
        .update(updateData)
        .eq('id', requestId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating exhumation request status:', error);
      throw error;
    }
  }

  // Delete exhumation request
  static async deleteExhumationRequest(requestId) {
    try {
      const { error } = await supabase
        .from('exhumation_requests')
        .delete()
        .eq('id', requestId);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting exhumation request:', error);
      return false;
    }
  }

  // ============================================
  // ADMIN PLOT MANAGEMENT
  // ============================================

  // Create new plot
  static async createPlot(plotData) {
    try {
      const { data, error } = await supabase
        .from('plots')
        .insert([{
          plot_id: plotData.plot_id,
          section: plotData.section,
          level: plotData.level,
          plot_number: plotData.plot_number,
          status: plotData.status || 'available',
          occupant_name: plotData.occupant_name || null,
          date_of_birth: plotData.date_of_birth || null,
          date_of_death: plotData.date_of_death || null,
          date_of_interment: plotData.date_of_burial || null,
          age: plotData.age ? parseInt(plotData.age) : null,
          cause_of_death: plotData.cause_of_death || null,
          religion: plotData.religion || null,
          family_name: plotData.family_name || null,
          next_of_kin: plotData.next_of_kin || null,
          contact_number: plotData.contact_number || null,
          address: plotData.address || null,
          notes: plotData.notes || null
        }])
        .select()
        .single();
      
      if (error) throw error;
      console.log('✅ Plot created successfully:', data);
      return data;
    } catch (error) {
      console.error('Error creating plot:', error);
      throw new Error(`Failed to create plot: ${error.message}`);
    }
  }

  // Update existing plot
  static async updatePlot(plotId, plotData) {
    try {
      const { data, error } = await supabase
        .from('plots')
        .update({
          section: plotData.section,
          level: plotData.level,
          plot_number: plotData.plot_number,
          status: plotData.status,
          occupant_name: plotData.occupant_name || null,
          date_of_birth: plotData.date_of_birth || null,
          date_of_death: plotData.date_of_death || null,
          date_of_interment: plotData.date_of_burial || null,
          age: plotData.age ? parseInt(plotData.age) : null,
          cause_of_death: plotData.cause_of_death || null,
          religion: plotData.religion || null,
          family_name: plotData.family_name || null,
          next_of_kin: plotData.next_of_kin || null,
          contact_number: plotData.contact_number || null,
          address: plotData.address || null,
          notes: plotData.notes || null,
          updated_at: new Date().toISOString()
        })
        .eq('plot_id', plotId)
        .select()
        .single();
      
      if (error) throw error;
      console.log('✅ Plot updated successfully:', data);
      return data;
    } catch (error) {
      console.error('Error updating plot:', error);
      throw new Error(`Failed to update plot: ${error.message}`);
    }
  }

  // Delete plot
  static async deletePlot(plotId) {
    try {
      const { error } = await supabase
        .from('plots')
        .delete()
        .eq('plot_id', plotId);
      
      if (error) throw error;
      console.log('✅ Plot deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting plot:', error);
      throw new Error(`Failed to delete plot: ${error.message}`);
    }
  }
}

export default DataService;
