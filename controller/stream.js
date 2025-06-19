const Stream = require("node-rtsp-stream");
const activeStreams = new Map();
const moment = require("moment");

const getFiles = async (req, res) => {
  try {
    const magnet = req.query.magnet;
    if (!magnet) return res.status(400).send("Missing magnet link");

    const WebTorrentModule = await import("webtorrent");
    const WebTorrent = WebTorrentModule.default;

    const client = new WebTorrent();

    client.add(magnet, { sequential: true }, (torrent) => {
      const files = torrent.files.map((file) => ({
        name: file.name,
        length: file.length,
        path: file.path,
      }));

      res.status(200).json({ success: true, files });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const stream = async (req, res) => {
  try {
    const { magnet, filename } = req.body;
    if (!magnet || !filename) {
      return res.status(400).send("Missing magnet or filename");
    }

    const WebTorrentModule = await import("webtorrent");
    const WebTorrent = WebTorrentModule.default;
    const client = new WebTorrent();

    client.add(magnet, { sequential: true }, (torrent) => {
      const file = torrent.files.find((f) => f.name === filename);
      if (!file) {
        return res.status(404).send("File not found in torrent");
      }

      res.setHeader("Content-Type", "video/mp4");
      res.setHeader("Accept-Ranges", "bytes");

      const range = req.headers.range;
      if (!range) {
        file.createReadStream().pipe(res);
      } else {
        const positions = range.replace(/bytes=/, "").split("-");
        const start = parseInt(positions[0], 10);
        const end = positions[1] ? parseInt(positions[1], 10) : file.length - 1;

        res.status(206).header({
          "Content-Range": `bytes ${start}-${end}/${file.length}`,
          "Content-Length": end - start + 1,
        });

        file.createReadStream({ start, end }).pipe(res);
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ success: false, error: err.message });
  }
};

const startStream = async (req, res) => {
  try {
    const host = req.headers.host.split(":")[0];
    const { channel } = req.query;
    if (!channel || !portMap[channel]) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or missing channel" });
    }

    if (activeStreams.has(channel)) {
      return res.status(200).json({
        success: true,
        wsUrl: `ws://${host}:${portMap[channel]}/`,
      });
    }

    const stream = new Stream({
      name: channel,
      streamUrl: `rtsp://${process.env.CCTV_USERNAME}:${process.env.CCTV_PASSWORD}@${process.env.CCTV_IP}/Streaming/channels/${channel}`,
      wsPort: portMap[channel],
      ffmpegOptions: {
        "-stats": "",
        "-r": 30,
        "-s": "1920x1080",
        "-b:v": "3000k",
        "-preset": "veryfast",
      },
    });

    activeStreams.set(channel, stream);

    res.status(200).json({
      success: true,
      wsUrl: `ws://${host}:${portMap[channel]}/`,
    });
  } catch (err) {
    console.error("Stream Error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

const stopStream = async (req, res) => {
  try {
    const { channel } = req.query;

    if (!channel) {
      return res
        .status(400)
        .json({ success: false, message: "Missing channel" });
    }

    const stream = activeStreams.get(channel);

    if (!stream) {
      return res
        .status(404)
        .json({ success: false, message: "Stream not found" });
    }

    stream.stop();
    activeStreams.delete(channel);

    res
      .status(200)
      .json({ success: true, message: `Stream ${channel} stopped` });
  } catch (err) {
    console.error("Stop Stream Error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

const viewRecordings = async (req, res) => {
  try {
    const host = req.headers.host.split(":")[0];
    const { channel, datetime } = req.query;

    if (!channel || !portMap[channel]) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or missing channel" });
    }

    if (!datetime) {
      return res
        .status(400)
        .json({ success: false, message: "Missing datetime in query" });
    }

    const startMoment = moment(datetime);
    if (!startMoment.isValid()) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid datetime format" });
    }

    const formatted = moment(datetime).utc().format("YYYYMMDDTHHmmss") + "z";

    const wsPort = portMap[channel];

    const rtspUrl = `rtsp://${process.env.CCTV_USERNAME}:${process.env.CCTV_PASSWORD}@${process.env.CCTV_IP}/Streaming/tracks/${channel}?starttime=${formatted}`;

    if (activeStreams.has(channel)) {
      return res.status(200).json({
        success: true,
        wsUrl: `ws://${host}:${wsPort}/`,
        message: "Stream already active",
      });
    }

    const stream = new Stream({
      name: `recording-${channel}`,
      streamUrl: rtspUrl,
      wsPort,
      ffmpegOptions: {
        "-stats": "",
        "-r": 30,
        "-s": "1920x1080",
        "-b:v": "3000k",
        "-preset": "veryfast",
      },
    });

    activeStreams.set(channel, stream);

    return res.status(200).json({
      success: true,
      wsUrl: `ws://${host}:${wsPort}/`,
    });
  } catch (error) {
    console.error("View Recordings Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

const portMap = {
  101: 9900,
  102: 9901,
  201: 9902,
  202: 9903,
  301: 9904,
  302: 9905,
  401: 9906,
  402: 9907,
  501: 9908,
  502: 9909,
  601: 9910,
  602: 9911,
};

module.exports = { getFiles, stream, startStream, stopStream, viewRecordings };
