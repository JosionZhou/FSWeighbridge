// index.js
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

Component({
  data: {
    motto: 'Hello World',
    userInfo: {
      avatarUrl: defaultAvatarUrl,
      nickName: '',
    },
    hasUserInfo: false,
    canIUseGetUserProfile: wx.canIUse('getUserProfile'),
    canIUseNicknameComp: wx.canIUse('input.type.nickname'),
    isPaySuccess:false
  },
  methods: {
    onLoad(option) {
      console.log("onLoad_Option,",option);
    },
    // onShow(option) {
    //   let main = this;
    //   const eventChannel = this.getOpenerEventChannel();
    //   console.log("indexEventChannel:",eventChannel);
    //   if (eventChannel != null) {
    //     eventChannel.on("checkPaySuccess", res => {
    //       //如果检测到在支付页面里面已经完成支付，则当前界面刷新；如若未支付成功，则保留支付界面，客户可能需要重新发起支付
    //       if (res) {
    //         console("接收页面。收到结果.",res);
    //         main.onLoad();
    //       }
    //     });
    //   }
    // },
    // 事件处理函数
    bindViewTap() {
      wx.navigateTo({
        url: '../logs/logs'
      })
    },
    onChooseAvatar(e) {
      const {
        avatarUrl
      } = e.detail
      const {
        nickName
      } = this.data.userInfo
      this.setData({
        "userInfo.avatarUrl": avatarUrl,
        hasUserInfo: nickName && avatarUrl && avatarUrl !== defaultAvatarUrl,
      })
    },
    onInputChange(e) {
      const nickName = e.detail.value
      const {
        avatarUrl
      } = this.data.userInfo
      this.setData({
        "userInfo.nickName": nickName,
        hasUserInfo: nickName && avatarUrl && avatarUrl !== defaultAvatarUrl,
      })
    },
    getUserProfile(e) {
      // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认，开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
      wx.getUserProfile({
        desc: '展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
        success: (res) => {
          console.log(res)
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    },
  },

})