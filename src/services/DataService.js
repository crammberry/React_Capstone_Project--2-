import { supabase } from '../supabase/config';

// Central data service to replace all mock data generation
export class DataService {
  // Get all plots from database
  static async getAllPlots() {
    try {
      const { data, error } = await supabase
        .from('plots')
        .select('*')
        .order('section', { ascending: true })
        .order('level', { ascending: true })
        .order('plot_number', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching plots:', error);
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
      
      const { data, error } = await supabase
        .from('plots')
        .select('*')
        .eq('plot_id', plotId)
        .single();
      
      console.log('Database query result:', { data, error });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching plot:', error);
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
        .order('request_date', { ascending: false });
      
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
}

export default DataService;
