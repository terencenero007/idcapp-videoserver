navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
var constraints = { audio: true, video: { width: { min: 640, ideal: 640, max: 1280 }, height: { min: 480, ideal: 480, max: 720 } } };
var mediaRecorder;
var recordingFrequency = 10;

// Initialize recoding settings by calling getUserMedia
function initializeRecorder() {
    console.log("In initializeRecorder");
    navigator.getUserMedia(constraints, function (stream) {
        // Notofication after initializing media
        // Initialize recorder here
        console.log("Inside getUserMedia");
        var options = { mimeType: 'video/webm; codecs="vorbis,vp8"' };
        mediaRecorder = new MediaRecorder(stream, options);
        mediaRecorder.ondataavailable = onDataAvailable;
        console.log("Recorder initialized");
    }, function (e) {
        console.log("Error in getUserMedia " + e);
    });
};

// Notification when the recording data available
// Read the given blob and post to server using video API
function onDataAvailable(e) {
    // console.log("In onDataAvailable " + e.data.size);
    if (e.data.size > 0) {
        var reader = new FileReader();
        reader.addEventListener("loadend", function () {
            if (reader.result.byteLength > 0) {
                var data = reader.result;
                // console.log("Posting data " + data);
                var url = location.origin + "/video";
                var httpRequest = new XMLHttpRequest();
                httpRequest.open("POST", url, true);
                httpRequest.send(data);
            }
        });
        reader.readAsArrayBuffer(e.data);
    }
};

// Start the media recording in given interval
function startRecording() {
    console.log("Recording starting");
    mediaRecorder.start(recordingFrequency);
};

// Stop the media recording
function stopRecording() {
    console.log("Recording stopping");
    mediaRecorder.stop();
};
