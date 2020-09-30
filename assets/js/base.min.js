let txt = 'babel!';

// 数値を価格に整えるフィルター(#,###)
Vue.filter('num_format', function(val) {
    return val.toLocaleString();
});

// 商品一覧コンポーネント
var app = new Vue({
  el: '#app',
  data: {
    url: './assets/data/itemData.js',
    //「セール対象」のチェック状態（true：チェック有り、false：チェック無し）
    //showSaleItem: false,
    //「送料無料」のチェック状態（true：チェック有り、false：チェック無し）
    //showDelvFree: false,
    //「並び替え」の選択値（1：標準、2：価格が安い順）
    //sortOrder: 1,
    campaign: "200921_marathon_pre",
    shippingFree: 3850,
    items: [],
    categoryList: [],
    recommends: [
        {id: 1, url: 'https://www.rakuten.ne.jp/gold/mb/page/18_rkDeal/rk.html', image: 'assets/image/rcmd_01.jpg', text: 'ポイントバック10%OVER！<br>楽天スーパーDEAL開催中', target: true},
        {id: 3, url: 'https://www.rakuten.ne.jp/gold/mb/mb/article/103/rk.html', image: 'assets/image/rcmd_03.jpg', text: 'レディースダウンウェアブランド<br>完全攻略', target: true},
        {id: 2, url: 'https://www.rakuten.ne.jp/gold/mb/page/list/brand/rimowa/modelchange/rk.html', image: 'assets/image/rcmd_02.jpg', text: 'リモワ全モデル完全ガイド2020AW', target: true},
        {id: 4, url: 'https://www.rakuten.ne.jp/gold/mb/mb/article/102/rk.html', image: 'assets/image/rcmd_04.jpg', text: '大人が選ぶ、不動のアイコンスニーカー', target: true},
        {id: 5, url: 'https://www.rakuten.ne.jp/gold/mb/page/gift/rk.html', image: 'assets/image/rcmd_05.jpg', text: 'ギフト ～ Gift<br>大切な人に贈るギフト特集', target: true},
        {id: 6, url: 'https://www.rakuten.ne.jp/gold/mb/page/brand_new/aw/rk.html', image: 'assets/image/rcmd_06.jpg', text: '2020年秋冬新作<br>入荷ブランド一覧', target: true},
        {id: 7, url: 'https://www.rakuten.ne.jp/gold/mb/page/review_coupon/rk.html', image: 'assets/image/rcmd_07.jpg', text: 'レビューを書いて<br>500円OFFクーポン', target: true},
        {id: 8, url: 'https://item.rakuten.co.jp/mb/c/0000002899/', image: 'assets/image/rcmd_08.jpg', text: 'お買い得価格目白押し！<br>アウトレット', target: true}
    ],
    isError: false,
    errorMessage: ''
  },
  methods: {
    arrangeToPrice: function (price) {
        return price.toLocaleString();
    },
    createCategory: function (items) {
        for (var i=0; i<items.length; i++) {
            this.categoryList.push(items[i].category);
        }

        this.categoryList = this.categoryList.filter(function (x, i, self) {
            return self.indexOf(x) === i;
        });
        // console.log("created category.");
    },
    updateList: function (items) {
      for (var i=0; i<this.categoryList.length; i++) {
        // console.log(this.categoryList[i]);
        eval("var " + this.categoryList[i] + " = \"\";");
        var html = "";

        for (var k=0; k<items.length; k++) {
          if (this.categoryList[i] === items[k].category) {
            // console.log(this.categoryList[i] + "と一致");
            $("." + this.categoryList[i]).append(this.createItemTag(items[k]));
          }
        }
      }
      // console.log("updated itemList.");
    },
    createItemTag: function (item) {
      // return item.image + "しました";
      var html = `<li class="item">
                    <a href="https://item.rakuten.co.jp/mb/${item.no}/?utm_source=lp&utm_campaign=${this.campaign}" target="_brank"><img src="${item.image}">
                    ${item.season !== "" ? '<span class="note">' + item.season + '</span>' : ''}
                    </a>
                    <p class="item__term">販売期間前</p>
                    <p class="item__brand">${item.brand}</p><p class="item__item">${item.kind}</p>
                    ${item.price > this.shippingFree ? '<p class="item__price shipping__free">' : '<p class="item__price">'}
                    &yen;<span>${this.arrangeToPrice(item.price)}</span>税込</p><p>&nbsp;</p>
                    <p class="btn__fav">
                      <a href="https://my.bookmark.rakuten.co.jp/?func=reg&version=314&svid=120&itype=1&shop_bid=195888&iid=${item.item_id}" target="_blank">☆ お気に入りに追加</a>
                    </p>
                  </li>`;
      return html;
    }
  },
  created: function() { // ライフサイクルハック
    $.ajax({
      url : this.url,
      type: 'GET',
      dataType: 'jsonp', // レスポンスデータのタイプ
      jsonp: 'callback', // クエリパラメータ名
      jsonpCallback: 'items' // コールバック関数名
    })
    .done(function(data, textStatus, jqXHR) {
      this.items = data;
      this.createCategory(this.items);
      this.updateList(this.items);
      // console.log(this.categoryList);
    }.bind(this))
    .fail(function(jqXHR, textStatus, errorThrown) {
      this.isError = true;
      this.errorMessage = '商品データの読み込みに失敗しました';
    }.bind(this));
  },
  computed: {
    // 絞り込み後の商品リストを返す算出プロパティ
    recommendList: function() {
      // 絞り込み後の商品リストを格納する新しい配列
      var newList = [];
      for (var i=0; i<this.recommends.length; i++) {
        // 表示対象かどうかを判定するフラグ
        var isShow = true;
        // i番目の商品が表示対象かどうかを判定する
        if (this.showSaleItem && !this.recommends[i].isSale) {
        //「セール対象」チェック有りで、セール対象商品ではない場合
        isShow = false;  // この商品は表示しない
        }
        if (this.showDelvFree && this.recommends[i].delv > 0) {
        //「送料無料」チェック有りで、送料有りの商品の場合
        isShow = false;  // この商品は表示しない
        }
        // 表示対象の商品だけを新しい配列に追加する
        if (isShow) {
        newList.push(this.recommends[i]);
        }
      }
      // 新しい配列を並び替える
      if (this.sortOrder == 1) {
        // 元の順番にpushしているので並び替え済み
      }
      else if (this.sortOrder == 2) {
        // 価格が安い順に並び替える
        newList.sort(function(a,b){
          return a.price - b.price;
        });
      }
      // 絞り込み後の商品リストを返す
      return newList;
    }
  }
});

// console.log('read.');
$(function() {
// $(".fv__nav").clone(true).addClass("fixed").appendTo(".main__fv");
$(".header__nav .nav__items").clone(true).css("display", "block").appendTo(".menu__cont");
$(".info__items").clone(true).appendTo(".menu__cont");

//
var sexStatus = "men";
if (sexStatus == "men") {
	$(".isWomen").hide();
	$(".isMen").show();
	$(".sex__items .sex__men").addClass("active");
} else {
	$(".isMen").hide();
	$(".isWomen").show();
	$(".sex__items .sex__women").addClass("active");
}

//
});

/*======================================================
初期化
======================================================*/
$(window).load(function() {

	var host = location.hostname;
	// base_url = "https://www.modern-blue.com/ec/cmHeaderSearchProduct/doSearchProduct/cmHeader/%20/%20/1/%20?wd=";

	if (host.indexOf("modern-blue.com") != -1) {
		base_url = "https://www.modern-blue.com";
		shop = "mb";
	} else if (host.indexOf("rakuten.ne.jp") != -1) {
		base_url = "https://item.rakuten.co.jp/mb/";
		shop = "rk";
	} else if (host.indexOf("shopping.geocities.jp") != -1) {
		base_url = "https://shopping.geocities.jp/mb-y/yh/";
		shop = "yh";
	} else if (host.indexOf("localhost") != -1) {
		base_url = "https://www.modern-blue.com";
		shop = "mb";
	} else {
		base_url = "https://item.rakuten.co.jp/mb/";
		shop = "rk";
	}

	$(".shop__url").attr("href", base_url);

	// GAタグの読み込み
	if (shop == "mb") {
		// console.log("本店");
		/*$.ajax({
			url: 'assets/js/ga.min.js',
			dataType: 'script',
			cache: false
		});*/
	} else {
		// console.log("その他");
	};
	// SNSボタンの表示
	if (shop == "mb") {
		$(".sns").show();
	};





});

/*======================================================
ナビゲーションによるスクロール
======================================================*/
$(function() {
	// $('a').click(function() {
	$('a[href^="#"]').click(function() {

		var speed = 500;
		var href= $(this).attr("href");//移動先を取得
		var target = $(href == "#" || href == "" ? "html" : href);
		//var adjust = 103;
		var adjust = 40;

		// Colorbox inline HTML表示用
		if (href == '#inline_content') {
			return true;
		}

		//if ($('.header__nav[data-cat=pc]').is(':hidden') && $('.menu__cont').is(':visible')) {
		if ($('.header__nav').is(':hidden') && $('.menu__cont').is(':visible')) {
			$('.menu__cont').slideToggle();
			$('.toggle').removeClass('active');
			adjust -= 0;
		}

		var position = target.offset().top - adjust;//移動先を数値で取得、メニューの高さ分を差し引く
		$("body, html").animate({scrollTop:position}, speed, "swing");

		return false;
	});
});

/*======================================================
トップに戻るボタン
======================================================*/
$(function(){
	var topBtn = $("#totop");
	var headerNav = $(".header__nav");
	$(window).scroll(function(){
		if ($(this).scrollTop() > 103) {
			topBtn.fadeIn('fast');
			headerNav.addClass("fixd");
		} else {
			topBtn.fadeOut('fast');
			headerNav.removeClass("fixd");
		}
	});
});

/*======================================================
スライダー
======================================================*/
$(function() {
	$('.list__wrap').slick({
		infinite: true,
		slidesToShow: 1,
 		slidesToScroll: 1,
		arrows: true,
		dots: false,
		adaptiveHeight: true,//高さを自動可変
		//vertical: true,//縦スクロールにするか
		asNavFor: '.tabs',
		responsive: [{
			breakpoint: 415,//width:415px以下(SM)
				settings: {
					// variableWidth: false,
					arrows: false,
					// dots:true,
				}
			}/*,
			{
			breakpoint: 415,//width:415px以下(SP)
				settings: {
					variableWidth: false,
				}
			}*/
		]
	});
	$('.tabs').slick({
		infinite: false,
		slidesToShow: 2,//表示するカテゴリーの数に合わせて変更
		slidesToScroll: 1,
		arrows: false,
		asNavFor: '.list__wrap',
		dots: false,
		// centerMode: true,
		focusOnSelect: true
	});
	$('.banner__items').slick({
		arrows: false,
		dots: false,
		infinite: true,
		autoplay: true,
		autoplaySpeed: 3000,
		slidesToShow: 1,
 		slidesToScroll: 1
	});
});

/*======================================================
フィルタリング
======================================================*/
/*$(function() {
	$('#tags .tag:not(.a)').hide();// 初期表示はイニシャルAのみを表示

	$("#btns .btn.active").click(function() {
		// console.log(this);
		var initial = this.children[0].className;
		// console.log(initial);
		$('#tags .tag').hide();
		if (initial == "all") {
			$('#tags .tag').fadeIn();
		} else {
			$('#tags .' + initial).fadeIn();
		}
	});
});*/
$(function() {
	$(".sex__items .item").on('click', function() {
		$(".sex__items .item").removeClass("active");
		$(this).addClass("active");
		$(".isMen, .isWomen").hide();

		if ($(this).hasClass("sex__men")) {
			$(".isMen").fadeIn();
		} else if ($(this).hasClass("sex__women")) {
			$(".isWomen").fadeIn();
		}

	});

	$(".headline__btn .btn__sex a").on('click', function() {
		$(".sex__items .item").removeClass("active");
		$(".isMen, .isWomen").hide();

		if ($(this).hasClass("sex__men")) {
			$(".isMen").fadeIn();
			$(".sex__items .sex__men").addClass("active");
		} else if ($(this).hasClass("sex__women")) {
			$(".isWomen").fadeIn();
			$(".sex__items .sex__women").addClass("active");
		}
	});
});

/*======================================================
メニューの表示/非表示
======================================================*/
$(function(){
	$('.toggle').click(function(){
		$('.menu__cont').slideToggle("fast");
		$(this).toggleClass('active');
	});
});

/*======================================================
検索
======================================================*/
$('.onSearch').on('click', function(e){
	// var search_wd = encodeURIComponent('BBGG ' + $(this).siblings().val());
	var search_wd = encodeURIComponent($(this).siblings().val());

	if (shop == "mb") {
		var open_url = "https://www.modern-blue.com/ec/cmHeaderSearchProduct/doSearchProduct/cmHeader/%20/%20/1/%20?wd=" + search_wd;
	} else if (shop == "rk") {
		var open_url = "https://search.rakuten.co.jp/search/mall/" + search_wd + "/?sid=195888";
	} else if (shop == "yh") {
		var open_url = "https://store.shopping.yahoo.co.jp/mb-y/search.html?p=" + search_wd + "#CentSrchFilter1";
	}

	// window.location.href = base_url + wd;
	// open(base_url + search_wd, '_blank');
	open(open_url, '_blank');
});
