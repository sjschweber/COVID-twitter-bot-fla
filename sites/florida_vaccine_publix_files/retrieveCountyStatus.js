function retrieveCountiesStatus(url, status = null){
    var xhr = new XMLHttpRequest
    xhr.open('GET', url, true);
    xhr.onreadystatechange = function() {
        if(xhr.readyState == 4) {
            var response = xhr.responseText.trim();
            var container = document.getElementById('counties');
            removeChildren(container);
            var countiesArray = response.split(/\r?\n/);
            countiesArray.forEach(element => {
                row = element.split('|');
                var countyName = row[0].trim();
				//var countyStatus = (status && row[1].trim().toLowerCase() != 'none available') ? status : row[1].trim();
				var countyStatus = (status && !row[1].toLowerCase().includes('none available')) ? status : row[1].trim();

				if( row[1].toLowerCase().includes('none available') && !row[1].toLowerCase().includes('no disponibles')){
					countyStatus = countyStatus.trim() +' (No disponibles)';
				}
				
                createTableRowElements(container, countyName, countyStatus);
            });
			var source = document.getElementById('counties');
			var destination = document.getElementById('countiesSp');
			if(destination){
				var copy = source.cloneNode(true);
				copy.setAttribute('id', 'countiesSp');
				destination.parentNode.replaceChild(copy, destination);
			}
        }
    }
    xhr.setRequestHeader('Content-Type', 'text/plain');
    xhr.send();
}

function removeChildren(parent){
    while(parent.firstChild){
        parent.removeChild(parent.firstChild)
    }
}

function createTableRowElements(parentDiv, name, status){
    var tr = document.createElement('tr');
    var countyTd = document.createElement('td');
    countyTd.appendChild(document.createTextNode(name));
    var statusTd = document.createElement('td');
    statusTd.appendChild(document.createTextNode(status));
    tr.appendChild(countyTd);
    tr.appendChild(statusTd);
    parentDiv.appendChild(tr);
}