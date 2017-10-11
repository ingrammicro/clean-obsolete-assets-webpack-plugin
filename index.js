'use strict'

const fs = require('fs')
const del = require('del')
const path = require('path')

module.exports = CleanObsoleteAssets

function CleanObsoleteAssets(options) {
	this.previousAssets = this._getPreviousAssets(options.statsFilePath)
}

CleanObsoleteAssets.prototype.apply = function(compiler) {
	compiler.plugin('after-emit', this._removeObsoleteFiles.bind(this, compiler))
}

CleanObsoleteAssets.prototype._removeObsoleteFiles = function(compiler, compilation, done) {

	let newAssets = compilation.getStats().toJson().assets
		.filter(asset => asset.emitted)
		.map(asset => asset.name)

	this.previousAssets
		.filter(asset => newAssets.indexOf(asset) == -1)
		.map(fileName => path.join(compiler.outputPath, fileName))
		.forEach(this._deleteFile)

	done()
}

CleanObsoleteAssets.prototype._deleteFile = function(filePath) {
	del.sync(filePath, {force: true})
	console.info('Old assets file has been removed: ', filePath)
}

CleanObsoleteAssets.prototype._getPreviousAssets = function(statsFilePath) {
	var assets = []
	try {
		assets = JSON.parse(fs.readFileSync(statsFilePath, 'utf8', { flag : 'r' })).assets
			.map(asset => asset.name)
	} finally {
		return assets
	}
}
