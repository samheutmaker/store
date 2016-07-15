const Upload = require('s3-uploader');


var client = new Upload('makermeeks', {
	aws: {
		path: 'images/',
		region: 'us-west-2',
		acl: 'public-read'
	},

	cleanup: {
		versions: true,
		original: false
	},

	original: {
		awsImageAcl: 'private'
	},

	versions: [{
		maxHeight: 1040,
		maxWidth: 1040,
		format: 'jpg',
		suffix: '-large',
		quality: 80,
		awsImageExpires: 31536000,
		awsImageMaxAge: 31536000
	}, {
		maxWidth: 780,
		aspect: '3:2!h',
		suffix: '-medium'
	}, {
		maxWidth: 320,
		aspect: '16:9!h',
		suffix: '-small'
	}, {
		maxHeight: 100,
		aspect: '1:1',
		format: 'png',
		suffix: '-thumb1'
	}, {
		maxHeight: 250,
		maxWidth: 250,
		aspect: '1:1',
		suffix: '-thumb2'
	}]
});



const s3UploadPromise = function(src, options) {	
	return new Promise((resolve, reject) => {
		client.upload(src, options, (err, versions, meta) => {

			if(err) {
				return reject(err);
			}

			resolve(versions);

		});
	});
};


module.exports = exports = s3UploadPromise;