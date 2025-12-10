# V2board原版前端主题分离

### 部署流程>

1.新建网站，将源码放在根目录下解压

2.logo图片命名为facicon.png放在根目录下

3.本地验证码无法加载，只适配google和cloudflare

4.更换v2board支付回调页面以适配前端分离

  1>文件位于app/Services/PaymentService.php
  
  2>找到
  
```
'return_url' => url('/#/order/' . $order['trade_no']),
```

  3>改为
  
```
//'return_url' => url('/#/order/' . $order['trade_no']),    //返回订单页(原主题)
'return_url' => $_SERVER['HTTP_ORIGIN'] . "/index.html#/stage/dashboard",    //返回用户首页(分离主题)
```

  4>测试回调

6.更换icon后无变化时修改 index.html 中 "<link rel="icon" href="/favicon.png?v=xxx" />"的版本号

7.自定义api路径时，搜索 /assets 路径下 Umi.js 中的 /api/v1 字段并修改为自定义字段，例如 /example
