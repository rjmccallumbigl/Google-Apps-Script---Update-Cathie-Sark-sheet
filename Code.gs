/*********************************************************************************************************
*
* Instructions
* 1. Create a new Google Sheet. 
* 2. Open Google Apps Script.
* 3. At top, click Resources -> Libraries -> add this library: M1lugvAXKKtUxn_vdAG9JZleS6DrsjUUV 
and select Version 8 (or latest version). Save.
* 4. Delete all text in the scripting window and paste all this code.
* 5. Run onOpen().
* 6. Then run parseObject() from the Code or from the spreadsheet.
* 7. Accept the permissions and after running, the spreadsheet should update.
*
*********************************************************************************************************/

function onOpen() {
  SpreadsheetApp.getUi().createMenu('Functions')
  .addItem('Clear and Update Scrape Sheet', 'parseObject')
  .addToUi();
}

/*********************************************************************************************************
*
* Scrape web content.
* 
* @param {String} query The search string to look for
*
* @return {String} Desired web page content.
*
* References
* https://www.reddit.com/r/googlesheets/comments/jyhl3g/import_data_behind_java_scripts/
* https://www.fantasypros.com/nfl/rankings/dynasty-overall.php
* https://www.kutil.org/2016/01/easy-data-scrapping-with-google-apps.html
*
*********************************************************************************************************/

function getData(query) {
  var url = "https://cathiesark.com/ark-funds-combined/complete-holdings";
  var fromText = query;
  var toText = ',"page":"/[etf]/complete-holdings"';
  
  var content = UrlFetchApp.fetch(url).getContentText();
//  DriveApp.createFile("createFile.txt", content);
  var scraped = Parser
  .data(content)
  .setLog()
  .from(fromText)
  .to(toText)
  .build();
  console.log(scraped);
  return scraped;
}

/*********************************************************************************************************
*
* Print scraped web content to Google Sheet.
* 
*********************************************************************************************************/

function parseObject(){
  
  //  Declare variables
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var keyArray = [];
  var playerArray = [];
  var sheetName = "";
  var sheet = {};
  var searchArray = [{'query': '{"props":'}];
  
  //  Return website data, convert to Object
  var ResponseText = getData(searchArray[0].query);
  var ResponseTextJSON = JSON.parse(ResponseText);  
  
  //  Select object key with player data in it
  searchArray[0].returnKey = ResponseTextJSON.pageProps.arkPositions;
  
  //  Print player data to sheet
  for (var search = 0; search < searchArray.length; search++){
    
    // Define an array of all the returned object's keys to act as the Header Row
    if (searchArray[search].returnKey != ""){
      keyArray.length = 0;
      keyArray = Object.keys(searchArray[search].returnKey[0]);
      playerArray.length = 0;
      playerArray.push(keyArray);
      
      //  Capture players from returned data
      for (var x = 0; x < searchArray[search].returnKey.length; x++){
        playerArray.push(keyArray.map(function(key){ return searchArray[search].returnKey[x][key]}));
      }
      
      // Select the spreadsheet range and set values  
      sheetName = "https://cathiesark.com/ark-funds-combined/complete-holdings";
      try{
        sheet = spreadsheet.insertSheet(sheetName);
      } catch (e){
        sheet = spreadsheet.getSheetByName(sheetName).clear();
      }
      sheet.setFrozenRows(1);
      sheet.getRange(1, 1, playerArray.length, playerArray[0].length).setValues(playerArray);
    }
  }
}