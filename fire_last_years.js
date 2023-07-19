//load fire dataset
var fire_col2 = ee.Image("projects/mapbiomas-workspace/public/collection7_1/mapbiomas-fire-collection2-monthly-burned-coverage-1");

//region
var roi = ee.FeatureCollection("users/ipam_flp/Analyses/Restoration_Carbon_Market/roi");

//set last years
var fire_last_year = 2;

var years = [ 1985, 1986, 1987, 1988, 1989, 1990, 1991, 1992,
              1993, 1994, 1995, 1996, 1997, 1998, 1999, 2000,
              2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008,
              2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016,
              2017, 2018, 2019, 2020, 2021, 2022 ];

//convert to filter the list with years
var last_year = years.slice(fire_last_year * (-1));

print(last_year);

//function to return the anual fire dataset
var fire = last_year.map(function(e){
  
  var image = fire_col2.select('burned_coverage_' + e).gt(0.1).clip(roi);
  
  image = ee.Image(1).mask(image);
  
  return image; 
  
});

//join the anual fire image into image collection
var imgCol = ee.ImageCollection(fire).mosaic();

print(imgCol);

//add to map
Map.addLayer(imgCol, {palette: 'red'}, 'mosaic');
