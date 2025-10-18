-- Check what apartment plots exist in the database
SELECT plot_id, section, level, plot_number 
FROM plots 
WHERE plot_id LIKE 'apartment%' 
ORDER BY plot_id;



