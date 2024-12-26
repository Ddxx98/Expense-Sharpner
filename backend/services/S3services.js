const aws = require('aws-sdk');

exports.uploadtoS3 = async (data, filename, bucket)=>{
    const s3 = new aws.S3({
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY 
    });
    const params = {
        Bucket: bucket,
        Key: filename,
        Body: data,
        ACL: 'public-read'
    };
    try {
        const res = await s3.upload(params).promise();
        return res.Location; 
    } catch (err) {
        console.error('Error uploading to S3:', err);
        return null; 
    }
}