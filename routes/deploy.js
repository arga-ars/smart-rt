const express = require("express");
const router = express.Router();
const deployService = require("../services/deployService");

router.post("/", async (req, res) => {
  try {
    const secret = req.headers["x-webhook-secret"];

    if (secret !== process.env.DEPLOY_SECRET) {
      return res.status(403).send("Forbidden");
    }

    // optional: hanya deploy jika branch main
    if (req.body.ref && req.body.ref !== "refs/heads/main") {
      return res.send("Skip deploy (not main branch)");
    }

    const result = await deployService.runDeploy();

    res.send({
      message: "Deploy success",
      output: result,
    });
  } catch (err) {
    console.error("❌ Deploy error:", err);
    res.status(500).send("Deploy failed");
  }
});

module.exports = router;