var videoList = ["42.mp4", "43.mp4", "44.mp4"];
var videoIndex = 0;

export { videoList, videoIndex };

export const getVideoList = () => {
  return videoList;
}

export const setVideoIndex = (index) => {
  if (index >= 0 && index < videoList.length) {
    videoIndex = index;
  } else {
    console.error("Index out of bounds");
  }
}

export const getVideoIndex = () => {
  return videoIndex;
}