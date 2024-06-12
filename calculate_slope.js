var roi = ee.FeatureCollection("users/ipam_flp/Analyses/Restoration_Carbon_Market/Vetor/assentamentos_pogo");
var srtm = ee.Image("USGS/SRTMGL1_003");

var elevation = srtm.select('elevation').clip(roi);

var slope = ee.Terrain.slope(elevation);

var hillshade = ee.Terrain.hillshade(elevation);

var class_slope = slope
  .where(slope.lt(3), 1)                     // Plano
  .where(slope.gte(3).and(slope.lt(8)), 2)   // Suave ondulado
  .where(slope.gte(8).and(slope.lt(20)), 3)  // Ondulado
  .where(slope.gte(20).and(slope.lt(45)), 4) // Forte ondulado
  .where(slope.gte(45).and(slope.lt(75)), 5) // Montanhoso
  .where(slope.gte(75), 6);                  // Forte montanhoso


// Asset mapbiomas
var asset = class_slope;

// Asset of regions for which you want to calculate statistics
var assetTerritories = roi;

// Numeric attribute to index the shapefile
var attribute = "id";

// A list of class ids you are interested
var classIds = [
    1,2,3,4,5,6
];

// Output csv name
var outputName = 'areas_class_slope_pogo';

// Change the scale if you need.
var scale = 30;

// Define a list of years to export
var years = [
 '2022'
];

// Define a Google Drive output folder 
var driverFolder = 'AREA-EXPORT';

// Territory
var territory = roi;

// LULC mapbiomas image
var mapbiomas = class_slope.selfMask();

// Image area in km2
var pixelArea = ee.Image.pixelArea().divide(1000000);

// Geometry to export
var geometry = mapbiomas.geometry();

/**
 * Convert a complex ob to feature collection
 * @param obj 
 */
var convert2table = function (obj) {

    obj = ee.Dictionary(obj);

    var territory = obj.get('territory');

    var classesAndAreas = ee.List(obj.get('groups'));

    var tableRows = classesAndAreas.map(
        function (classAndArea) {
            classAndArea = ee.Dictionary(classAndArea);

            var classId = classAndArea.get('class');
            var area = classAndArea.get('sum');

            var tableColumns = ee.Feature(null)
                .set(attribute, territory)
                .set('class', classId)
                .set('area', area);

            return tableColumns;
        }
    );

    return ee.FeatureCollection(ee.List(tableRows));
};

/**
 * Calculate area crossing a cover map (deforestation, mapbiomas)
 * and a region map (states, biomes, municipalites)
 * @param image 
 * @param territory 
 * @param geometry
 */
var calculateArea = function (image, territory, geometry) {

    var reducer = ee.Reducer.sum().group(1, 'class').group(1, 'territory');

    var territotiesData = pixelArea.addBands(territory).addBands(image)
        .reduceRegion({
            reducer: reducer,
            geometry: geometry,
            scale: scale,
            maxPixels: 1e12
        });

    territotiesData = ee.List(territotiesData.get('groups'));

    var areas = territotiesData.map(convert2table);

    areas = ee.FeatureCollection(areas).flatten();

    return areas;
};

var areas = years.map(
    function (year) {
        var image = mapbiomas.select('slope');

        var areas = territory.map(
            function (feature) {
                return calculateArea(
                    image.remap(classIds, classIds, 0),
                    ee.Image().int64().paint({
                        'featureCollection': ee.FeatureCollection(feature),
                        'color': attribute
                    }),
                    feature.geometry()
                );
            }
        );

        areas = areas.flatten();

        // set additional properties
        areas = areas.map(
            function (feature) {
                return feature.set('year', year);
            }
        );

        return areas;
    }
);

areas = ee.FeatureCollection(areas).flatten();

Map.addLayer(territory);

Export.table.toDrive({
    collection: areas,
    description: outputName,
    folder: driverFolder,
    fileNamePrefix: outputName,
    fileFormat: 'CSV'
});