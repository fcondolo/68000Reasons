/** 
	WebGL engine by Soundy (Frederic Condolo)
	Released under WTFPL license (http://www.wtfpl.net/)
**/

jsLoader_loaded = new Array();
jsLoader_uniqueId = 0;
jsLoader_leftToLoad = 0;
jsLoader_totalLoad = 0;


function jsLoader_isReady() {
	if (jsLoader_leftToLoad > 0)
		console.log("Waiting for jsLoader to load " +  jsLoader_leftToLoad + " / " + jsLoader_totalLoad + " files...");
	return jsLoader_leftToLoad == 0;
}
				
				
function jsLoader_include(source)
{
	var sId = jsLoader_uniqueId.toString();
	jsLoader_uniqueId++;

	if ( ( source != null ) && ( !document.getElementById( sId ) ) ){
		var oHead = document.getElementsByTagName('HEAD').item(0);
		var oScript = document.createElement( "script" );
		oScript.language = "javascript";
		oScript.type = "text/javascript";
		oScript.id = sId;
		oScript.defer = true;
		oScript.text = source;
		oHead.appendChild( oScript );
	}
}

function jsLoader_load(urls, async) {
	for (var i = 0; i < urls.length; i++) {
		if (jsLoader_loaded[urls[i]]) {
			console.log("jsLoader_load skipped already loaded file: " + urls[i]);
			continue;
		}
		jsLoader_leftToLoad++;
		jsLoader_totalLoad++;
		var request = new XMLHttpRequest();
		request.rurl = urls[i];
		request.open('GET', urls[i], async);
		request.rindex = i;
		request.onreadystatechange = function () {
			if (this.readyState == 4) {
				jsLoader_include(this.responseText);
				jsLoader_loaded[this.rurl] = true;
				console.log("jsLoader_load loaded file: " + this.rurl);
				jsLoader_leftToLoad--;
			}
		};
		try {
			request.send(null);
		} catch (e) {
			alert("Error loading file:\n" + urls[i]+ "\n" + e.toString() + "\nMake sure file exists and HTTP Cross origin requests are enabled for your browser, or run the online version");
		}			
	}
}