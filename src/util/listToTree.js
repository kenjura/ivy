module.exports = { listToTree };

const DEFAULT_FIELDS = { id:'id', parentId:'parentId' }

function listToTree(dataset, { id, parentId }=DEFAULT_FIELDS) {
    let hashTable = Object.create(null)
    dataset.forEach( aData => hashTable[aData[id]] = { ...aData, childNodes : [] } )
    let dataTree = []
    dataset.forEach( aData => {
      if( aData[parentId] ) hashTable[aData[parentId]].childNodes.push(hashTable[aData[id]])
      else dataTree.push(hashTable[aData[id]])
    } )
    return dataTree
}