// Load the biomes feature collection and fire data image.
var bioma = ee.FeatureCollection("users/geomapeamentoipam/AUXILIAR/biomas_IBGE_250mil");
var col2 = ee.Image("projects/mapbiomas-workspace/public/collection7_1/mapbiomas-fire-collection2-monthly-burned-coverage-1");

// Generate the main panel and add it to the map.
var panel = ui.Panel({
  style: {
    width: '30%'
  }
});
ui.root.insert(0, panel);

// Define the title and description labels.
var intro = ui.Label('Coleção 2 vs Fire CCI, MCD64A1 e GABAM', {
  fontWeight: 'bold',
  fontSize: '24px',
  margin: '10px 5px'
});
var subtitle = ui.Label('Comparativo entre os dados do MapBiomas Fogo Col2 ' + 
                'e a soma dos produtos de fogo nos anos disponíveis.', {});

// Add the title and description to the panel.  
panel.add(intro).add(subtitle);

// Create a slider for selecting the year.
var dateSlider = ui.Slider({
  min: 1985,
  max: 2022,
  value: 1985,
  step: 1,
  style: {
    width: '200px'
  }
});

// Add an event listener to the date slider.
dateSlider.onChange(function() {
  filterData(); // Call the filterData function when the slider value changes.
});

// Add a label.
var yearLabel = ui.Label({value:'Selecione o Ano',
style: {fontSize: '18px', fontWeight: 'bold'}});
// Add the date slider to the panel.
panel.add(yearLabel);

panel.add(dateSlider);

// Create a select box for selecting the biome.
var selectBiome = ui.Select({
  items: ['Amazônia', 'Caatinga', 'Cerrado', 'Mata Atlantica', 'Pampa'],
  placeholder: 'Bioma',
  value: 'Amazônia'
});

// Add an event listener to the biome select box.
selectBiome.onChange(function() {
  filterData(); // Call the filterData function when the biome selection changes.
});

var biomeLabel = ui.Label({value:'Selecione o Bioma',
style: {fontSize: '18px', fontWeight: 'bold'}});
// Add the date slider to the panel.
panel.add(biomeLabel);
// Add the biome select box to the panel.
panel.add(selectBiome);

// Create a select box for selecting the data type.
var selectData = ui.Select({
  items: ['Concordância', 'Col2 - Somente', 'Dados de Referência - Somente'],
  placeholder: 'Data',
  value: 'Dados de Referência - Somente'
});

// Add an event listener to the data type select box.
selectData.onChange(function() {
  filterData(); // Call the filterData function when the data type selection changes.
});

// Add the data type select box to the panel.
var dataLabel = ui.Label({value:'Selecione o Comparativo',
style: {fontSize: '18px', fontWeight: 'bold'}});
// Add the date slider to the panel.
panel.add(dataLabel);
panel.add(selectData);

// Function to generate a hexagonal grid for a specific year, biome, and data type.
var hexGrid = function(year, biome, data) {
  // Hexagonal grid parameters.
  var diameter = 100000;
  var size = ee.Number(diameter).divide(Math.sqrt(3)); // Distance from center to vertex
  
  // Calculate hexagonal grid coordinates.
  var coords = ee.Image.pixelCoordinates(ee.Projection('EPSG:3058'));
  var vals = {
    x: coords.select("x"),
    u: coords.select("x").divide(diameter),
    v: coords.select("y").divide(size),
    r: ee.Number(diameter).divide(2),
  }; 
  var i = ee.Image().expression("floor((floor(u - v) + floor(x / r))/3)", vals);
  var j = ee.Image().expression("floor((floor(u + v) + floor(v - u))/3)", vals);

  // Turn the hex coordinates into a single "ID" number.
  var cells = i.long().leftShift(32).add(j.long()).rename("hexgrid");

  // Get the region of interest (ROI) for the selected biome.
  var region = bioma.filterMetadata('Bioma', 'equals', biome);

  // Create the fire data layers based on the selected data type.
  var fire_col2 = ee.Image(1).mask(col2.select('burned_coverage_' + year).rename('fire'));
  var grid = cells;
  var regionImg = ee.Image(0).byte().paint(region, 1);
  var mask = grid.addBands(regionImg).reduceConnectedComponents(ee.Reducer.max(), "hexgrid", 256);
  grid = grid.updateMask(mask);
  var fire = ee.Image(1).mask("users/ipam_flp/col2_mapbiomas_fire/analysis/products_gabam_modis_cci/mosaic_gabam_modis_cci_" + year + "_br");
  var image;
  
  // Apply the selected data type filtering to the fire data.
  if (data == 'Dados de Referência - Somente') {
    image = fire.updateMask(fire_col2.unmask().not());
  } else if (data == 'Col2 - Somente') {
    image = fire_col2.updateMask(fire.unmask().not());
  } else if (data == 'Concordância') {
    image = fire_col2.updateMask(fire);
  } else {
    image = ee.Image(); // Empty image if no data type is selected.
  }
  
  // Calculate the area of fire occurrences within each hexagon and add it to the grid.
  var area_fire = image.multiply(ee.Image.pixelArea()).divide(1e6);
  area_fire = area_fire.addBands(grid);
  var sum_area_fire = area_fire.reduceConnectedComponents(ee.Reducer.sum(), 'hexgrid', 256);

  return sum_area_fire;
};

// Function to update the map with the selected data.
function filterData() {
  var getYear = dateSlider.getValue();
  var getBiome = selectBiome.getValue();
  var getData = selectData.getValue();
  
  print(getYear, getBiome, getData); // Print the selected values to the console for debugging.
  
  Map.clear(); // Clear the map before updating it.
  
  // Generate the hexagonal grid overlay with the selected data.
  var hexgridfire = hexGrid(getYear, getBiome, getData);
  
  // Filter the biomes feature collection for the selected biome.
  var roi = bioma.filterMetadata('Bioma', 'equals', getBiome);
  
  // Clip the fire data layers to the selected biome.
  var fireLayer = ee.Image(1).mask("users/ipam_flp/col2_mapbiomas_fire/analysis/products_gabam_modis_cci/mosaic_gabam_modis_cci_" + getYear + "_br").clip(roi);
  var col2Layer = ee.Image(1).mask(col2.select('burned_coverage_' + getYear)).clip(roi);
  
  // Add the layers to the map.
  Map.centerObject(roi);
  Map.addLayer(hexgridfire, imageVisParam, 'Data');
  Map.addLayer(col2Layer, { palette: 'red' }, 'Coleção 2 - MapBiomas Fogo', false);
  Map.addLayer(fireLayer, { palette: 'blue' }, 'Dados de Referência', false);
 
}

// Visualization parameters for the hexagonal grid layer.
var imageVisParam = {
  "opacity": 1,
  "bands": ["constant"],
  "max": 1500,
  "palette": ["ffffe5", "fff7bc", "fee391", "fec44f", "fe9929", "ec7014", "cc4c02", "993404", "662506"]
};

filterData();

// Create a function to generate the legend.
var createLegend = function(visParams) {
  var legendPanel = ui.Panel({
    style: {
      position: 'bottom-left',
      padding: '8px 15px',
      width: '100px'
    }
  });

  // Create a title for the legend.
  var legendTitle = ui.Label('Legend - km²', { fontWeight: 'bold' });
  legendPanel.add(legendTitle);

  // Loop through the palette colors and create a color box with labels for each color.
  for (var i = 0; i < visParams.palette.length; i++) {
    var colorBox = ui.Panel({
      style: {
        width: '25px',
        height: '20px',
        backgroundColor: visParams.palette[i],
        margin: '0 0 4px 0'
      }
    });

    // Set the label for each color box with the corresponding legend value.
    var legendLabel = ui.Label({
      value: visParams.max * (i / (visParams.palette.length - 1)),
      style: { margin: '0 0 4px 6px' }
    });

    // Add the color box and label to the legend panel.
    legendPanel.add(colorBox);
    legendPanel.add(legendLabel);
  }

  return legendPanel;
};

// Call the createLegend function with the provided imageVisParam and add it to the map.
var legend = createLegend(imageVisParam);
Map.add(legend);
