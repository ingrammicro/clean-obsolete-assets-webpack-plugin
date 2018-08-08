'use strict'

const path = require('path')
const AWS = require('aws-sdk')

const flatMap = (f,xs) =>
	xs.reduce((acc,x) =>
		acc.concat(f(x)), [])

Array.prototype.$$flatMap = function(f) {
	return flatMap(f,this)
}

module.exports = CleanObsoleteAssets

function CleanObsoleteAssets(options) {
	this.s3 = new AWS.S3(options.S3Config.options)
	this.s3UploadOptions = options.S3Config.uploadOptions
	this.bundlePath = options.bundlePath
	this.previousAssets = this._getPreviousAssets(path.join(options.bundlePath, options.statsFileName))
}

CleanObsoleteAssets.prototype.apply = function(compiler) {
	compiler.plugin('after-emit', this._removeObsoleteFiles.bind(this, compiler))
}

CleanObsoleteAssets.prototype._removeObsoleteFiles = function(compiler, compilation, done) {

	console.log('Cleaning up previous bundle files')

	let newAssets = compilation.getStats().toJson().assets
		.filter(asset => asset.emitted)
		.map(asset => asset.name)

	this.previousAssets.then( assets => {
		if (!assets || !assets.length) return Promise.resolve()
		return Promise.all(assets.filter(asset => newAssets.indexOf(asset) == -1)
			.$$flatMap( fileName => {
				return [
					this._deleteS3File(path.join(this.bundlePath, fileName)),
					this._deleteS3File(path.join(this.bundlePath, fileName+'.gz'))
				]
			}))

	})
	.then(() => done())
	.catch( (err) => {
		console.error(err)
		done()
	})
}

CleanObsoleteAssets.prototype._deleteS3File = function(file) {
	console.info(`Deleting file: ${file}`)
	return this.s3.deleteObject({Key: file, ...this.s3UploadOptions}).promise()
}

CleanObsoleteAssets.prototype._getPreviousAssets = function(statsFile) {
	return this.s3.getObject({Key: statsFile, ...this.s3UploadOptions}).promise()
		.then( stats => JSON.parse(stats.Body.toString()).assets.map(asset => asset.name))
		.catch( err => console.log('No previous bundle find'))
}
