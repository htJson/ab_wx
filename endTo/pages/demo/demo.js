Page({
  data: {
    // text:"这是一个页面"
    actionSheetHidden: true,
    actionSheetItems: [
      { bindtap: 'Menu1', txt: '菜单1' },
      { bindtap: 'Menu2', txt: '菜单2' },
      { bindtap: 'Menu3', txt: '菜单3' }
    ],
    menu: ''
  },
  actionSheetTap: function () {
    this.setData({
      actionSheetHidden: !this.data.actionSheetHidden
    })
  },
  actionSheetbindchange: function () {
    this.setData({
      actionSheetHidden: !this.data.actionSheetHidden
    })
  },
  bindMenu1: function () {
    this.setData({
      menu: 1,
      actionSheetHidden: !this.data.actionSheetHidden
    })
  },
  bindMenu2: function () {
    this.setData({
      menu: 2,
      actionSheetHidden: !this.data.actionSheetHidden
    })
  },
  bindMenu3: function () {
    this.setData({
      menu: 3,
      actionSheetHidden: !this.data.actionSheetHidden
    })
  }
})