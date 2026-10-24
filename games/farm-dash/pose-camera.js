(async function () {
  const gate = document.getElementById('camera-gate');
  const button = document.getElementById('enable-camera');
  const status = document.getElementById('camera-status');
  const video = document.getElementById('camera-preview');
  if (!gate || !button || !status || !video) return;
  button.addEventListener('click', async () => {
    if (!navigator.mediaDevices?.getUserMedia) { status.textContent = 'Camera access requires HTTPS or localhost.'; return; }
    button.disabled = true; status.textContent = 'Waiting for camera permission…';
    try {
      video.srcObject = await navigator.mediaDevices.getUserMedia({video: true, audio: false});
      await video.play(); video.style.display = 'block'; gate.style.display = 'none'; status.textContent = 'Loading pose detector…';
      const {FilesetResolver, PoseLandmarker} = await import('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21/+esm');
      const vision = await FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21/wasm');
      const detector = await PoseLandmarker.createFromOptions(vision, {baseOptions: {modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task'}, runningMode: 'VIDEO', numPoses: 1});
      status.textContent = 'Pose detector ready'; let lastLane = null, lastSent = 0, previousHip = null, previousHands = false;
      function detect() {
        const now = performance.now(), points = detector.detectForVideo(video, now).landmarks?.[0];
        if (points) { const ls=points[11], rs=points[12], lw=points[15], rw=points[16], lh=points[23], rh=points[24];
          if (ls&&rs&&lw&&rw&&lh&&rh) { const x=1-(ls.x+rs.x+lh.x+rh.x)/4, hip=(lh.y+rh.y)/2, lane=x<.32?0:x>.68?2:1, hands=lw.y<ls.y-.04&&rw.y<rs.y-.04, jump=previousHip!==null&&previousHip-hip>.02, respawn=hands&&!previousHands;
            if (lane!==lastLane||jump||respawn||now-lastSent>150) { const ids={left_shoulder:11,right_shoulder:12,left_elbow:13,right_elbow:14,left_wrist:15,right_wrist:16,left_hip:23,right_hip:24,left_knee:25,right_knee:26,left_ankle:27,right_ankle:28}; const keypoints=Object.fromEntries(Object.entries(ids).map(([n,i])=>[n,[points[i].x,points[i].y]])); if(window.streetRunnerPose) window.streetRunnerPose(JSON.stringify({type:'pose',lane,jump:Boolean(jump),hands_up:hands,respawn,keypoints})); lastLane=lane; lastSent=now; } previousHip=hip; previousHands=hands; }
        } requestAnimationFrame(detect);
      } detect();
    } catch (error) { console.error(error); button.disabled=false; status.textContent='Camera or pose detector failed. Use HTTPS and check internet access.'; }
  });
})();
