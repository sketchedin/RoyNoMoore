var elements = Array.from(document.body.getElementsByTagName('*'))
var title = document.head.getElementsByTagName('title')[0];

console.log("TESTEST")

chrome.storage.sync.get({list: []}, function(result) {
    var blockedList = result.list ? result.list : [];

    // Update Page Title
    var results = scan(title.text, blockedList)
    results ? updateTitle(results) : null

    elements.forEach((node) => {
        Array.from(node.childNodes).forEach(checkText(blockedList))
    })

});

function checkText(blockedList) {
    return function(blockedList, childNode) {
        if(childNode.nodeType == 3 && childNode.nodeValue) {
            var results = scan(childNode.nodeValue, blockedList)
            results ? update(childNode, results) : null
        }
    }.bind(this, blockedList)
}

function scan(text, blockedList) {
    //let scannedText = match(text, blockedList);
    var str = text
    var scannedText = []
    let result = match(str, blockedList)
    while(result) {
        scannedText.push(result)
        str = str.substr(result.index + result[0].length)
        result = match(str, blockedList)
    }
    return scannedText
}

function match(text, blockedList) {
    var regEx = new RegExp(blockedList.join("|"), 'i')
    return text.match(regEx);
}

function createSpan(node, obj) {
    var newNode = document.createElement('span')
    newNode.style.color = 'transparent'
    newNode.style.textShadow = "0 0 0.6em black"
    newNode.textContent = obj[0]
    return newNode
}

function createNodeWithText(node, text) {
    var newNode = node.cloneNode()
    newNode.textContent = text
    return newNode
}

function updateDOM(originalNode, newNodeArray) {
    var newElements = newNodeArray.map(newNode => {
        return originalNode.parentNode.insertBefore(newNode, originalNode)
    })
    originalNode.parentNode.removeChild(originalNode)
    return newElements[2]
}

function update(node, matchObjectArray) {
    matchObjectArray.forEach(matchObject => {
        //console.log(node)
        var firstHalfNode = createNodeWithText(node, matchObject.input.substr(0, matchObject.index))
        var newNode = createSpan(node, matchObject)
        var secondHalfNode = createNodeWithText(node, matchObject.input.substr(matchObject.index + matchObject[0].length, matchObject.input.length - 1))

        node = updateDOM(node, [firstHalfNode, newNode, secondHalfNode])

    })
}

function updateTitle(matchObject) {
    var newTitle = matchObject[0].input.replace(matchObject[0], "Someone")
    chrome.runtime.sendMessage({newTitle: newTitle}, function(response) {});
}


