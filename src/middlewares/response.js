module.exports = {
  success(res, status, data) {
    return res.status(status).json({
      status,
      data,
    });
  },

  error(res, status, message) {
    console.log({ err: message });
    return res.status(status).json({
      status,
      message,
    });
  },
};
