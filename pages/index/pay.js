// pages/index/pay.js
import {
  AuthServerAddress,
  ServerAddress,
  NetRequest,
  GetCode,
  ClearCode
} from '../../app.js';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    openId: null,
    billImagePath: '',
    isPaySuccess: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let main = this;
    let payReqData = JSON.parse(options.params);
    wx.showLoading({
      title: '正在请求支付',
      mask: true
    })
    this.data.openId = wx.getStorageSync("OpenId");
    console.log("openId:", this.data.openId);
    GetCode(function (code) {
      wx.getUserInfo({
        success: function (res) {
          let reqData = {
            url: AuthServerAddress + "/WeChatAuth/OAuth10",
            data: {
              code: code,
              iv: res.iv,
              encryptedData: res.encryptedData
            },
            success: function (res1) {
              console.log(res1);
              wx.setStorageSync("OpenId", res1.openid);
              wx.setStorageSync("session_id", res1.session_id)
              wx.setStorageSync("auth", res1.auth)
              main.data.openId = res1.openid;
              payReqData.WxOpenId = res1.openid;
              ClearCode();
              console.log("getOauth10Success:", res1);
              main.pay(payReqData);
            },
            fail: function () {
              ClearCode();
            }
          }
          NetRequest(reqData);
        }
      });
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    //如果已支付完成，点击左上角返回时，直接回到称重首页
    if (this.data.isPaySuccess) {
      wx.redirectTo({
        url: '/pages/index/index'
      });
    }
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },
  pay(reqData) {
    let main = this;
    var data = {
      url: ServerAddress + '/Measure/PayWeighingFee',
      data: reqData,
      success: function (res) {
        console.log("wxPaymentParams:", res);
        let wxPaymentParams = JSON.parse(res.Data);
        wxPaymentParams.success = function(res) {
          wx.hideLoading();
          wx.showToast({
            title: '支付成功',
            icon: "success"
          });
          main.getBillFile(reqData.ObjectId);
        }
        wxPaymentParams.fail = function(err) {
          wx.hideLoading();
          console.log(err);
          wx.showModal({
            title: '支付失败',
            content: "请重新支付",
            showCancel:false,
            complete:function(res){
              wx.navigateBack();
            }
          });
        }
        wx.requestPayment(wxPaymentParams);
      },
      fail: function (err) {
        console.log(err);
        wx.hideLoading();
        wx.showModal({
          title: '操作失败',
          content: err.data.ExceptionMessage,
          showCancel:false,
          complete:function(res){
            wx.navigateBack();
          }
        });
      }
    }
    NetRequest(data);
  },
  getBillFile(objectId){
    let main=this;
    wx.hideLoading();
    wx.showLoading({
      title: '获取磅单',
      mask:true
    });
    let checkBillFile = setInterval(() => {
      let checkBillFileReq={
        url:ServerAddress+'/Measure/IsWeightBillFileOK?objectId=' + objectId,
        method:"GET",
        success:function(res){
          if(res){
            clearInterval(checkBillFile);
            wx.hideLoading();
            wx.downloadFile({
              url: ServerAddress + '/Measure/GetWeightBillFile?objectId=' + objectId,
              success: function (res) {
                if (res.statusCode == 200) {
                  console.log("billTempPath:", res.tempFilePath);
                  main.setData({
                    billImagePath: res.tempFilePath,
                    isPaySuccess: true
                  });
                }
              }
            });
          }
        },
        fail:function(err){
          wx.hideLoading();
          console.log(err);
          clearInterval(checkBillFile);
          wx.showModal({
            title: '提示',
            content: '获取磅单失败，是否重新获取',
            complete: (res) => {
              if (res.confirm) {
                main.getBillFile(objectId);
              }
            }
          });
        }
      }
      NetRequest(checkBillFileReq);
    }, 1000);
  },
  preview(){
    wx.previewImage({
      urls: [this.data.billImagePath],
    });
  }
})