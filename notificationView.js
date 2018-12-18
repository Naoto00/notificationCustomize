jQuery.noConflict();

(function($) {
    'use strict';
    // アプリカスタマイズjsと競合する可能性があるのでアプリ画面ではロードしない
    const domain = '{subdomain}.cybozu.com'; // ご自身の環境のサブドメイン
    // if (!(location.href.startsWith('https://' + domain + '/k/#/') || location.href === 'https://' + domain + '/k/')) return;
    if (!(location.href.indexOf('https://' + domain + '/k/#/') === 0 || location.href === 'https://' + domain + '/k/')) return;

    const taskAPPID = xx; // To DoアプリID
    const loginUserCode = kintone.getLoginUser().code;

    // スピナー表示
    function showSpinner() {
        // Initialize
        if ($('.kintone-spinner').length === 0) {
            // Create elements for the spinner and the background of the spinner
            const spin_div = $('<div id ="kintone-spin" class="kintone-spinner"></div>');
            const spin_bg_div = $('<div id ="kintone-spin-bg" class="kintone-spinner"></div>');

            // Append spinner to the body
            $(document.body).append(spin_div, spin_bg_div);

            // Set a style for the spinner
            $(spin_div).css({
                'position': 'fixed',
                'top': '50%',
                'left': '50%',
                'z-index': '510',
                'background-color': '#fff',
                'padding': '26px',
                '-moz-border-radius': '4px',
                '-webkit-border-radius': '4px',
                'border-radius': '4px'
            });
            $(spin_bg_div).css({
                'position': 'absolute',
                'top': '0px',
                'left': '0px',
                'z-index': '500',
                'width': '100%',
                'height': '200%',
                'background-color': '#000',
                'opacity': '0.5',
                'filter': 'alpha(opacity=50)',
                '-ms-filter': 'alpha(opacity=50)'
            });

            // Set options for the spinner
            const opts = {
                'color': '#000'
            };

            // Create the spinner
            new Spinner(opts).spin(document.getElementById('kintone-spin'));
        }

        // Display the spinner
        $('.kintone-spinner').show();
    }

    // bodyのスピナー非表示
    function hideSpinner() {
        // Hide the spinner
        $('.kintone-spinner').hide();
    }

    // タスク登録アプリにレコードを登録する
    function postAction() {
        const body = {
            'app': taskAPPID,
            'record': {
                'To_Do': {
                    'value': $('.form-example [name=task]').val()
                },
                'Details': {
                    'value': $('.form-example [name=detail]').val()
                },
                'Duedate': {
                    'value': $('.form-example [name=date]').val()
                },
                'From': {
                    'value': moment().format('YYYY-MM-DD')
                },
                'Priority': {
                    'value': $('[name=radio]:checked').val()
                },
                'Assignees': {
                    'value': [{
                        'code': loginUserCode
                    }]
                }
            }
        };
        return kintone.api('/k/v1/record', 'POST', body).then(function(resp) {
            console.log(resp);
            return resp;
        }).catch(function(err) {
            console.log(err);
        });
    }

    // 登録したレコードのステータスを進める
    function updateAssignee(resp) {
        const body = {
            'app': taskAPPID,
            'id': resp.id,
            'action': '依頼する（担当者を設定後）',
            'assignee': loginUserCode
        };
        return kintone.api('/k/v1/record/status', 'PUT', body);
    }

    // タスク登録フォームをリセットする
    function resetAction() {
        $('.form-example [name=task]').val('');
        $('.form-example [name=detail]').val('');
        $('#date').val(moment().format('YYYY-MM-DD'));
        $('#radio-0').prop('checked', true);
    }

    // タスク登録フォーム作成
    function taskElmRender() {
        // タスク登録用の要素
        const boxHtml = $('<div class="sampleBox">' +
                            '<div class="kintoneplugin-label">タスク登録</div>' +
                            '<form class="form-example">' +
                                // タスク名
                                '<div class="form-block">' +
                                    '<div><label>Task name: </label></div>' +
                                    '<input type="text" name="task" id="name" required>' +
                                '</div>' +
                                // タスク詳細
                                '<div class="form-block">' +
                                    '<div><label>Details: </label></div>' +
                                    '<textarea name="detail" id="detail"></textarea>' +
                                '</div>' +
                                // 優先度ラジオボタン
                                '<div class="form-block">' +
                                    '<div><label>Priority: </label></div>' +
                                    '<div class="kintoneplugin-input-radio">' +
                                        '<span class="kintoneplugin-input-radio-item">' +
                                            '<input type="radio" name="radio" value="A" id="radio-0" checked="">' +
                                            '<label for="radio-0">A</label>' +
                                            '</span>' +
                                            '<span class="kintoneplugin-input-radio-item">' +
                                            '<input type="radio" name="radio" value="B" id="radio-1">' +
                                            '<label for="radio-1">B</label>' +
                                        '</span>' +
                                        '<span class="kintoneplugin-input-radio-item">' +
                                            '<input type="radio" name="radio" value="C" id="radio-2">' +
                                            '<label for="radio-2">C</label>' +
                                        '</span>' +
                                    '</div>' +
                                '</div>' +
                                // タスク期限
                                '<div class="form-block">' +
                                    '<div><label>Due date: </label></div>' +
                                    '<input type="date" name="date" id="date">' +
                                '</div>' +
                                // 登録リセットボタン
                                '<div class="form-block">' +
                                    '<button class="kintoneplugin-button-dialog-ok" id="post" type="submit">登録</button>' +
                                    '<button class="kintoneplugin-button-dialog-cancel" type="reset">リセット</button>' +
                                '</div>' +
                            '</form>' +
                        '</div>');
        boxHtml.css({
            'display': 'inline-block',
            'float': 'right',
            'vertical-align': 'top',
            'width': '25%',
            'max-width': '340px',
            'background-color': $('.gaia-header-header').css('background-color')
        });
        // 通知ブロック編集
        $('.ocean-ntf-ntflist').css({
            'display': 'inline-block',
            'vertical-align': 'top',
            'width': '75%',
        });
        // 登録フォーム描画
        $('.ocean-ntf-ntflist').after(boxHtml);
        // 登録フォームCSS編集
        $('.form-example').css({
            'min-width': '335px',
            'margin-left': '5px'
        });
        // 登録フォームパーツ編集
        $('.form-block').css({
            'margin-bottom': '10px'
        });
        // 登録リセットボタン綺麗に
        $('.kintoneplugin-button-dialog-ok').css({
            'margin-right': '5px'
        });
        // 登録フォーム日付初期値
        $('#date').val(moment().format('YYYY-MM-DD'));

        // 登録ボタン押下時の処理
        $('.form-example').on('submit', function(e) {
            e.preventDefault();
            showSpinner();
            postAction().then(function(resp) {
                return updateAssignee(resp);
            }).then(function(resp) {
                hideSpinner();
                alert('タスク登録しました。');
                resetAction();
            }).catch(function(err) {
                alert(err.message);
            });
        });

        // リセットボタン押下時の処理
        $('.form-example').on('reset', function(e) {
            e.preventDefault();
            resetAction();
        });
    }

    // バインドする
    const body = $('.body-top');
    const observer = new MutationObserver(function(MutationRecord) {
        const noticesBlock = $('.ocean-ntf-ntfitem');
        // 通知要素が出現するまでリターン
        if (!noticesBlock.length) return;
        // 既にフォームが存在する場合
        if ($('.sampleBox').length) return;
        // タスク登録フォーム作成
        taskElmRender();
        // すべての処理が終わったらバインド終了
        observer.disconnect();
    });

    // バインドする要素のオプション
    const options = {
        childList: true
    };

    observer.observe(body[0], options);

    // ハッシュ切り替えの時もバインドが必要
    $(window).on('hashchange', function() {
        // 通知画面以外のハッシュ値変更の場合リターン
        if (!location.href.indexOf('https://' + domain + '/k/#/ntf/') === 0) return;
        observer.observe(body[0], options);
    });

})(jQuery);
