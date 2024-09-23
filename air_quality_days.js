// Define the start and end dates for the time period of interest
var startDate = ee.Date('2024-01-01');  // Start of the year 2024
var endDate = ee.Date('2024-08-31');    // End of August 2024

// Define a function that processes the daily image for a given date
function processDailyImage(date) {
  date = ee.Date(date);  // Ensure the date is in Earth Engine date format
  
  // Define the end of the day by advancing the date by one day
  var dayEnd = date.advance(1, 'day');
  
  // Create an ImageCollection from the ECMWF/CAMS/NRT dataset for the specified date
  // Filter by date and geometry (spatial area of interest) and select the PM2.5 surface data
  var dailyCollection = ee.ImageCollection('ECMWF/CAMS/NRT')
    .filterDate(date, dayEnd)  // Filter the collection for the given day
    .filterBounds(geometry)    // Filter the collection by the region of interest (geometry)
    .select('particulate_matter_d_less_than_25_um_surface')  // Select the PM2.5 variable
    .map(function(img) {
      // Multiply the PM2.5 values by 1e9 to convert to µg/m³ and 
      // check if the values are greater than or equal to 65 µg/m³
      return img.multiply(1e9).gte(65);
    });
  
  // Return the maximum value from the daily collection, representing the worst-case PM2.5 level for that day
  return dailyCollection.max();
}

// Create a daily max collection by iterating over each day between the start and end dates
var dailyMaxCollection = ee.ImageCollection(
  // Create a sequence of numbers representing the day offsets between startDate and endDate
  ee.List.sequence(0, endDate.difference(startDate, 'day').subtract(1))
    .map(function(dayOffset) {
      // For each day, advance from the start date and process the image for that day
      var day = startDate.advance(dayOffset, 'day');
      return processDailyImage(day);  // Call the processDailyImage function for each day
    })
);

// Calculate the total number of days where PM2.5 exceeded 65 µg/m³ by summing the binary values (1 for exceedance, 0 otherwise)
var countDaysAbove65 = dailyMaxCollection.reduce(ee.Reducer.sum()).rename('qtd_days');  // Sum all days where PM2.5 was above 65 µg/m³

// Print the result to the console
print(countDaysAbove65);

// Add the result to the map, clipping it to the region of interest (geometry)
// Set a color palette where white represents low counts and red represents high counts
Map.addLayer(countDaysAbove65.clip(geometry), {min: 0, max: 31, palette: ['white', 'red']}, 'Days Above 65 µg/m³');
