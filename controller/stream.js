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

module.exports = { getFiles, stream };
