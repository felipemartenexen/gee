
var bacia = ee.FeatureCollection('users/ipam_flp/imoveis_analise_buffer_500m').geometry();
/**
 * 
 * SCRIPT: export-qualityMosaic
 * 
 * Objetivo: Analisar e exportar imagens Landsat (5, 7 e 8)
 * como mosaicos anuais de 1985 a 2020, construidos a partir
 * de bandas de qualidade (ndvi, bsi e nbr) para cada bioma
 * 
 * Desenvolvimento: Wallace Silva - IPAM - GT/Fogo
 * Janeiro de 2020
 * 
 * Contato: wallace.silva@ipam.org.br
 * 
*/

// --- --- --- --- --- --- --- --- --- --- --- OPTIONS START CODE --- --- --- --- --- --- --- --- --- --- ---
// --- --- OPTIONS
// --- --- options 

// principal bands for detection scar fires
// '-nbr',
var qualityBand = '-nbr';

// valid cloud masks inputs -> 'bqa', 'bqaHigh', 'mapbiomasMask' and 'noMask'
var cloudMask = 'bqaHigh';

//bands export
var bandsExport = ['red','nir','swir1','swir2'];

// valid biomes inputs -> 'Amazônia', 'Caatinga', 'Cerrado', 'Mata Atlântica', 'Pampa' and 'Pantanal'
var string = 'Amazônia';

// define a list of bad images
var blockList = require('users/geomapeamentoipam/GT_Fogo_MapBiomas:2_Colecao_1.0_2021/module-blockList').blockList();


// years for export
var listYears = [
  1985,1986,1987,1988,1989,1990,1991,1992,1993,1994,
  1995,1996,1997,1998,1999,2000,2001,2002,2003,2004,
  2005,2006,2007,2008,2009,2010,2011,2012,
  2013,2014,2015,2016,2017,2018,2019,2020, 2021
  //2020
  ];
  
// Correlation dictionary and utils list
var landsatYears = {
  // -reference
  // 'LANDSAT/LT05/C01/T1_SR', //1984-01-01T00:00:00 - 2012-05-05T00:00:00
  // 'LANDSAT/LE07/C01/T1_SR', //1999-01-01T00:00:00 - 2021-01-24T00:00:00 // -> use until 2012 //Scanner broker failure on May 31, 2003, causing loss of 22% of the total image 
  // 'LANDSAT/LC08/C01/T1_SR', //2013-04-11T00:00:00 - 2021-01-22T00:00:00
  
  // 'lx' for Landsat 5 merge Landsat 7 and 'ly' for Landsat 7 merge Landsat 8
  
  1985:'l5',  1986:'l5',  1987:'l5',  1988:'l5',  1989:'l5',
  1990:'l5',  1991:'l5',  1992:'l5',  1993:'l5',  1994:'l5',
  1995:'l5',  1996:'l5',  1997:'l5',  1998:'l5',
  
  1999:'l7',  2000:'l7',  2001:'l7',  2002:'l7',
  
  2003:'l5',2004:'l5',  2005:'l5',  2006:'l5',  2007:'l5',  2008:'l5',
  2009:'l5',  2010:'l5',  2011:'l5',  2012:'l7',
  
  2013:'l8',  2014:'l8',  2015:'l8',  2016:'l8',  2017:'l8',
  2018:'l8',  2019:'l8',  2020:'l8',
};

// desntiny folder
// var folder = 'mapbiomas-fogo mosaicos de qualidade'
  
// --- --- --- --- --- --- --- --- --- --- ---  --- --- --- --- --- --- --- --- --- --- --- --- --- ---
var dictionary = {
  'Amazônia':{
    biomaSelect:'Amazônia',
    biomeName:'amazonia',
    geometryExport:bacia,
  },
  'Caatinga':{
    biomaSelect:'Caatinga',
    biomeName:'caatinga',
    geometryExport:CAATINGA,
  },
  'Cerrado':{
    biomaSelect:'Cerrado',
    biomeName:'cerrado',
    geometryExport:CERRADO,
  },
  'Mata Atlântica':{
    biomaSelect:'Mata Atlântica',
    biomeName:'mata_atlantica',
    geometryExport:MATAATLANTICA,
  },
  'Pampa':{
    biomaSelect:'Pampa',
    biomeName:'pampa',
    geometryExport:PAMPA,
  },
  'Pantanal':{
    biomaSelect:'Pantanal',
    biomeName:'pantanal',
    geometryExport:PANTANAL,
  },
}

var biomaSelect = dictionary[string].biomaSelect;
var biomeName = dictionary[string].biomeName;
var geometryExport = dictionary[string].geometryExport;


// --- --- --- --- --- --- --- --- --- --- --- Desenvolvimento --- --- --- --- --- --- --- --- --- --- ---


// --- --- dataset
var raster = {
    l5:'LANDSAT/LT05/C01/T1_SR', //1984-01-01T00:00:00 - 2012-05-05T00:00:00
    l7:'LANDSAT/LE07/C01/T1_SR', //1999-01-01T00:00:00 - 2021-01-31T00:00:00
    l8:'LANDSAT/LC08/C01/T1_SR', //2013-04-11T00:00:00 - 2021-01-22T00:00:00
    cover:'projects/mapbiomas-workspace/public/collection5/mapbiomas_collection50_integration_v1', // Brasil - 1985 à 2019
  };
var vector = {
    gridLandsat:'users/geomapeamentoipam/AUXILIAR/grid_landsat',
    focos:'users/geomapeamentoipam/AUXILIAR/focos/brasil/Focos_',
    brasil:'projects/mapbiomas-workspace/AUXILIAR/brasil_2km',
    biomas:'projects/mapbiomas-workspace/AUXILIAR/biomas_IBGE_250mil',
    regions:'users/geomapeamentoipam/AUXILIAR/regioes_biomas',
    sulAmerica:'projects/mapbiomas-workspace/AUXILIAR/America_do_Sul_BR2005',
    fireUFA:'users/wallacesilva/vetor/sonaira/LabGAMA_IncendiosFlorestais_'
    
  }
  
// --- --- import modules
var bns = require('users/mapbiomas/mapbiomas-mosaics:modules/BandNames.js');
var csm = require('users/mapbiomas/mapbiomas-mosaics:modules/CloudAndShadowMasking.js');
var col = require('users/mapbiomas/mapbiomas-mosaics:modules/Collection.js');
var dtp = require('users/mapbiomas/mapbiomas-mosaics:modules/DataType.js');
var ind = require('users/mapbiomas/mapbiomas-mosaics:modules/SpectralIndexes.js');
var mis = require('users/mapbiomas/mapbiomas-mosaics:modules/Miscellaneous.js');
var mos = require('users/mapbiomas/mapbiomas-mosaics:modules/Mosaic.js');
var sma = require('users/mapbiomas/mapbiomas-mosaics:modules/SmaAndNdfi.js');

// --- --- functions
function nbr (image) {

var exp = '( b("nir") - b("swir2") ) / ( b("nir") + b("swir2") )';

  var NBR = image
    .expression(exp)
    .rename("nbr")
    .add(1)
    .multiply(1000)
    // .subtract(1000)
    .int16();
    
  return image
    .addBands(NBR)
    .addBands(NBR.multiply(-1).rename('-nbr'));
}

function bsi (image) {

var exp = '( b("gv") - b("npv") - b("shade") ) / ( b("gv") + b("npv") + b("shade") )';

  var BSI = image
    .expression(exp)
    .rename("bsi")
    .add(1)
    .multiply(1000)
    .int16();
  
  return image
    .addBands(BSI);
}

function addMinBands (image){
  var oldBands = image.bandNames();
  var newBands = oldBands.map(function(string){
    return ee.String('-').cat(string);
  });
  
  return image
    .addBands(image
      .multiply(-1)
      .select(oldBands,newBands));
}

function  timeFlag (image) {

  var sensor = ee.String(image.get('SATELLITE'));
  sensor = sensor.slice(-1);
  
  sensor = ee.Number.parse(sensor);
  
  var path = ee.Number.parse(image.get('WRS_PATH'));
  var row = ee.Number.parse(image.get('WRS_ROW'));
  
  
  /* 
  // Symbol  Meaning                      Presentation  Examples
  // ------  -------                      ------------  -------
  // G       era                          text          AD
  // C       century of era (>=0)         number        20
  // Y       year of era (>=0)            year          1996
  
  // x       weekyear                     year          1996
  // w       week of weekyear             number        27
  // e       day of week                  number        2
  // E       day of week                  text          Tuesday; Tue
  
  // y       year                         year          1996
  // D       day of year                  number        189
  // M       month of year                month         July; Jul; 07
  // d       day of month                 number        10
  
  // a       halfday of day               text          PM
  // K       hour of halfday (0~11)       number        0
  // h       clockhour of halfday (1~12)  number        12
  
  // H       hour of day (0~23)           number        0
  // k       clockhour of day (1~24)      number        24
  // m       minute of hour               number        30
  // s       second of minute             number        55
  // S       fraction of second           number        978
  
  // z       time zone                    text          Pacific Standard Time; PST
  // Z       time zone offset/id          zone          -0800; -08:00; America/Los_Angeles
  
  // '       escape for text              delimiter
  // ''      single quote                 literal       '
  //*/    
  var dayOfYear = ee.Number.parse(ee.Date(image.get('system:time_start')).format('D'));
  var monthOfYear = ee.Number.parse(ee.Date(image.get('system:time_start')).format('M'));
  var year = ee.Number.parse(ee.Date(image.get('system:time_start')).format('Y'));
  var dayOfMonth = ee.Number.parse(ee.Date(image.get('system:time_start')).format('d'));
  // images: {
    dayOfYear = ee.Image(dayOfYear)
      .rename('dayOfYear')
      .int16();

    monthOfYear = ee.Image(monthOfYear)
      .rename('monthOfYear')
      .int16();

    year = ee.Image(year)
      .rename('year')
      .int16();

    dayOfMonth = ee.Image(dayOfMonth)
      .rename('dayOfMonth')
      .int16();

   sensor = ee.Image(sensor)
      .rename('sensor')
      .byte();

   path = ee.Image(path)
      .rename('path')
      .byte();

   row = ee.Image(row)
      .rename('row')
      .byte();
  // }
  
  return image
    .addBands(sensor)
    .addBands(dayOfYear)
    .addBands(monthOfYear)
    .addBands(year)
    .addBands(dayOfMonth)
    .addBands(path)
    .addBands(row)
    // .set({'string':string});
}

function applyCloudAndSahdowMask (collection) {

    var collectionWithMasks = csm.getMasks({
        'collection': collection,
        'cloudBQA': true,    // cloud mask using pixel QA
        'cloudScore': true,  // cloud mas using simple cloud score
        'shadowBQA': true,   // cloud shadow mask using pixel QA
        'shadowTdom': true,  // cloud shadow using tdom
        'zScoreThresh': -1,
        'shadowSumThresh': 4000,
        'dilatePixels': 2,
        'cloudHeights': [200, 700, 1200, 1700, 2200, 2700, 3200, 3700, 4200, 4700],
        'cloudBand': 'cloudBQAMask' //'cloudScoreMask' or 'cloudBQAMask'
    });

    // get collection without clouds
    var collectionWithoutClouds = collectionWithMasks.map(
        function (image) {
            return image.mask(
                image.select([
                    'cloudBQAMask',
                    'cloudScoreMask',
                    'shadowBQAMask',
                    'shadowTdomMask'
                ]).reduce(ee.Reducer.anyNonZero()).eq(0)
            );
        }
    );

    return collectionWithoutClouds;
}

function bqa(image){
    // Bits 3 and 5 are cloud shadow and cloud, respectively.
    var cloudShadowBitMask = ee.Number(2).pow(3).int();
    var cloudsBitMask = ee.Number(2).pow(5).int();

    // Get the pixel QA band.
    var qa = image.select('pixel_qa');

    // Both flags should be set to zero, indicating clear conditions.
    var mask = qa.bitwiseAnd(cloudShadowBitMask).eq(0) && (qa.bitwiseAnd(cloudsBitMask).eq(0));

    // Return the masked image, scaled to [0, 1].
    return image.updateMask(mask);
}

function bqaHigh (image) {
 var qa = image.select('pixel_qa');
 // If the cloud bit (5) is set and the cloud confidence (7) is high
 // or the cloud shadow bit is set (3), then it's a bad pixel.
 var cloud = qa.bitwiseAnd(1 << 5)
 .and(qa.bitwiseAnd(1 << 7))
 .or(qa.bitwiseAnd(1 << 3));
 // Remove edge pixels that don't occur in all bands
 var mask2 = image.mask().reduce(ee.Reducer.min());
 return image.updateMask(cloud.not()).updateMask(mask2)
}

function cutEmbroider (image) {
  var geometry = image.geometry().buffer(-3000);
  return image.clip(geometry);
} 

function addressLandsat (value){
  var lat = value['lat'];
  var lon = value['lon'];
  var point = ee.Geometry.Point([lon,lat]);
  
  var layers = Map.layers().filter(function(layer){
    return layer.getShown() === true
  })
  
  if (layers < 1){
    return; 
  }
  
  var reduce = layers[0].get('eeObject')
    .reduceRegion({
      reducer:ee.Reducer.sum(),
      geometry:point,
      scale:30,
      // crs:,
      // crsTransform:,
      // bestEffort:,
      maxPixels:1e11,
      // tileScale:
      })
    .getInfo()
      
      var sensorNames = {
        5:'LT05',
        7:'LE07',
        8:'LC08'
      }
      var pathNames = {
        1:'00'+reduce['path'],
        2:'0'+reduce['path'],
        3:''+reduce['path'],
      }
      var rowNames = {
        1:'00'+reduce['row'],
        2:'0'+reduce['row'],
        3:''+reduce['row'],
      }
      var monthNames = {
        1:'0'+reduce['monthOfYear'],
        2:''+reduce['monthOfYear'],
      }
      var dayNames = {
        1:'0'+reduce['dayOfMonth'],
        2:''+reduce['dayOfMonth'],
      }
          // "LC08_006065_20190914",
  var landsatName = sensorNames[reduce['sensor']] +
    '_' +
    pathNames[(''+reduce['path']).length] +
    rowNames[(''+reduce['row']).length] +
    '_' +
    reduce['year']+
    monthNames[(''+reduce['monthOfYear']).length] +
    dayNames[(''+reduce['dayOfMonth']).length];
    
  print('"'+ landsatName + '",');
  
  
  var bands = {
    'l5': bns.get('l5'),
    'l7': bns.get('l7'),
    'l8': bns.get('l8'),
  };
  var sensor = 'l'+reduce['sensor']
  var thumb = 
    ee.Image(raster[sensor] + '/' + landsatName)
    .select(bands[sensor].bandNames,bands[sensor].newNames)
    .visualize({min:300,max:4000,bands:['swir1','nir','red']});
  thumb = ui.Thumbnail({
    image:thumb,
    params:{
      // dimensions:256
      // region:''
      },
    // onClick:,
    // style:
    })
  
  print(thumb)

}

// --- --- outhers params
var brasil = ee.FeatureCollection(vector.brasil);
var bioma = ee.FeatureCollection(vector.biomas)
  .filter(ee.Filter.eq('Bioma',biomaSelect));

var geometria = bacia;
var geometriaMask = ee.Image(1).clip(geometria);

// endemembers collection
var endmembers = {
    'l4': sma.endmembers['landsat-4'],
    'l5': sma.endmembers['landsat-5'],
    'l7': sma.endmembers['landsat-7'],
    'l8': sma.endmembers['landsat-8'],
    'lx': sma.endmembers['landsat-5'],
};

// ---------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------

//cloudMasks
var cloudMasks = {
  'mapbiomasMask': function(image){

    var collectionWithMasks = app.functions.csm.getMasks({
        'collection': collection,
        'cloudBQA': true,    // cloud mask using pixel QA
        'cloudScore': true,  // cloud mas using simple cloud score
        'shadowBQA': true,   // cloud shadow mask using pixel QA
        'shadowTdom': true,  // cloud shadow using tdom
        'zScoreThresh': -1,
        'shadowSumThresh': 4000,
        'dilatePixels': 2,
        'cloudHeights': [200, 700, 1200, 1700, 2200, 2700, 3200, 3700, 4200, 4700],
        'cloudBand': 'cloudBQAMask' //'cloudScoreMask' or 'cloudBQAMask'
    });

    // get collection without clouds
    var collectionWithoutClouds = collectionWithMasks.map(
        function (image) {
            return image.mask(
                image.select([
                    'cloudBQAMask',
                    'cloudScoreMask',
                    'shadowBQAMask',
                    'shadowTdomMask'
                ]).reduce(ee.Reducer.anyNonZero()).eq(0)
            );
        }
    );

    return collectionWithoutClouds;
},

  'bqa': function (image){
    // Bits 3 and 5 are cloud shadow and cloud, respectively.
    var cloudShadowBitMask = ee.Number(2).pow(3).int();
    var cloudsBitMask = ee.Number(2).pow(5).int();

    // Get the pixel QA band.
    var qa = image.select('pixel_qa');

    // Both flags should be set to zero, indicating clear conditions.
    var mask = qa.bitwiseAnd(cloudShadowBitMask).eq(0) && (qa.bitwiseAnd(cloudsBitMask).eq(0));

    // Return the masked image, scaled to [0, 1].
    return image.updateMask(mask);
},

  'bqaHigh': function (image) {
     var qa = image.select('pixel_qa');
     // If the cloud bit (5) is set and the cloud confidence (7) is high
     // or the cloud shadow bit is set (3), then it's a bad pixel.
     var cloud = qa.bitwiseAnd(1 << 5)
     .and(qa.bitwiseAnd(1 << 7))
     .or(qa.bitwiseAnd(1 << 3));
     // Remove edge pixels that don't occur in all bands
     var mask2 = image.mask().reduce(ee.Reducer.min());
     return image.updateMask(cloud.not()).updateMask(mask2)
},

  'noMask': function(image){ 
    return image;
  },

};

listYears.forEach(
    function (year){
  
  var collectionID = landsatYears[year];
  var dateStart = ''+year+'-01-01';
  var dateEnd = ''+(year + 1)+'-01-01';
  var cloudCover = 70;
  
  var bands = {
    'l5': bns.get('l5'),
    'l7': bns.get('l7'),
    'l8': bns.get('l8'),
  };
  // 'lx' for Landsat 5 merge Landsat 7 and 'ly' for Landsat 7 merge Landsat 8
  if (collectionID === 'lx'){

    var collectionL5 = ee.ImageCollection(raster['l5'])
        .filterDate(dateStart,dateEnd)
        .select(bands['l5'].bandNames, bands['l5'].newNames);

    var collectionL7 = ee.ImageCollection(raster['l7'])
        .filterDate(dateStart,dateEnd)
        .select(bands['l5'].bandNames, bands['l5'].newNames);

    collection = collectionL5.merge(collectionL7);
  } else { 
    // print(collectionID)
    var collection = ee.ImageCollection(raster[collectionID])
        .filterDate(dateStart,dateEnd)
        .select(bands[collectionID].bandNames, bands[collectionID].newNames);
  }
  
  if (collectionID === 'ly'){

    var collectionL5 = ee.ImageCollection(raster['l5'])
        .filterDate(dateStart,dateEnd)
        .select(bands['l5'].bandNames, bands['l5'].newNames);
        
    var collectionL8 = ee.ImageCollection(raster['l8'])
        .filterDate(dateStart,dateEnd)
        .select(bands['l8'].bandNames, bands['l8'].newNames);
                
    collection = collectionL7.merge(collectionL8);
  
  }
  
 collection = collection
    .filter(ee.Filter.inList('system:index', blockList).not())
    //cloudMask
    .map(cloudMasks[cloudMask])
    // //recorte das bordas
    .map(cutEmbroider)
    .map(nbr)
    .map(timeFlag)
  
    // print('collection.first()',collection.first())
     
    var image = collection.qualityMosaic(qualityBand)
      // .select(bandsExport)
      .toFloat()
      .updateMask(geometriaMask)

      // dividindo
      // print(year,image)
      Map.addLayer(image,{min:300,max:4000,bands:['swir1','nir','red']},qualityBand + ' || ' + year,false);
      image = image
      .select(bandsExport)
      .divide(10000);

      // sem dividir
      // Map.addLayer(image,{min:400,max:4000,bands:['swir1','nir','red']},qualityBand + year,false)
    /*
      Export.image.toCloudStorage({
        image: image,
        description: biomeName+ '-' + qualityBand.slice(1,qualityBand.length)+ '-' + year,
        bucket: 'tensorflow-fire-cerrado1',
        // fileNamePrefix: 'mosaicos_to_classify_col1_bqahigh/'+ biomeName+ '-' + qualityBand.slice(1,qualityBand.length) + '-' + year,
        fileNamePrefix: 'mosaicos_to_classify_col1_'+cloudMask.toLowerCase()+'/'+ biomeName+ '-' + qualityBand.slice(1,qualityBand.length) + '-' + year,
        // fileNamePrefix: 'mosaicos_to_classify_col1/'+ biomeName+ '-' + qualityBand.slice(1,qualityBand.length) + '-' + year,
        maxPixels: 1e13,
        scale: 30,
        region: geometryExport
      });
*/
       Export.image.toDrive({
         image: image,
         description: biomeName+ '-' + qualityBand.slice(1,qualityBand.length)+ '-' + year,
         folder: 'mapiaeng/isa/',
      //   // fileNamePrefix: 'mosaicos_to_classify_col1_bqahigh/'+ biomeName+ '-' + qualityBand.slice(1,qualityBand.length) + '-' + year,
         fileNamePrefix: 'mosaicos_to_classify_col1_bqahigh/'+ biomeName+ '-' + qualityBand.slice(1,qualityBand.length) + '-' + year,
      //   // fileNamePrefix: 'mosaicos_to_classify_col1/'+ biomeName+ '-' + qualityBand.slice(1,qualityBand.length) + '-' + year,
         maxPixels: 1e13,
         scale: 30,
         region: bacia
       });
  }
);

// --- --- LEGENDA BOX

var listLayers = Map.layers().length()

listLayers = ee.List.sequence(0,(listLayers - 1)).reverse().getInfo()

var listWidgets = listLayers.map(function(i){
  var list = Map.layers().get(i)
  return ui.Checkbox({
    label:list.get('name'),
    value:list.get('shown'),
    onChange:function(value){
      list.setShown(value)
    },
    // disabled,
    style:{
      fontSize:'11px',
      backgroundColor:'ffffff00',
      // width:'25px',
      // height:'0px',
      margin:'0 0 0 0', 
    }
    
  })
})

var legend = ui.Panel({
  widgets:listWidgets,
  layout:ui.Panel.Layout.Flow('vertical'),
  style:{
    position:'bottom-left',
    fontSize:'11px',
    backgroundColor:'ffffffdd'
  }
})

Map.add(legend)

var checkbox = ui.Checkbox({
  label:'acionar click Map',
  value:false,
  onChange:function(value){
    if (value === true){
        Map.onClick(addressLandsat);
    } else {
      Map.onClick(false);
    }
  },
  // disabled, 
  // style
  })
var message = ui.Label('Para descobrir de qual imagem é, acione o checkBox e clique sobre sobre o pixel que quer investigar');

print(message,checkbox);

