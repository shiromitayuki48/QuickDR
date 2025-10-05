//==UserScript==
//name: [[Thành viên:Yuki Shiromita/Blog/QuickDR|QuickDR]] (Công cụ tạo biểu quyết phục hồi trang)
//description: Tạo nhanh trang biểu quyết phục hồi trang
//author: [[Thành viên:Yuki Shiromita|Yuki Shiromita]]
//version: 1.0.0
//<nowiki>
(function() {
    'use strict';
    var bq = {};
    window.bq = bq;
    $.when($.ready).then(function() {
        const actionsList = document.querySelector('#p-cactions ul');
        if (actionsList) {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = '#';
            a.textContent = 'Tạo biểu quyết phục hồi trang';
            li.appendChild(a);
            actionsList.appendChild(li);
            a.addEventListener('click', bq.callback);
        }
    });
    bq.callback = function() {
        var dialogHtml = `
            <div id="bq-dialog" title="Tạo biểu quyết phục hồi trang">
                <label for="bq-pageName">Tên trang cần phục hồi:</label><br>
                <input type="text" id="bq-pageName" style="width:100%;"><br><br>
                <label for="bq-reason">Lý do:</label><br>
                <textarea id="bq-reason" style="width:100%;height:80px;"></textarea><br><br>
            </div>
        `;
        $(document.body).append(dialogHtml);
        $("#bq-dialog").dialog({
            modal: true,
            width: 500,
            buttons: {
                "Tạo": function() {
                    const pageNameRaw = $('#bq-pageName').val().trim();
                    const reasonRaw = $('#bq-reason').val().trim();
                    if (!pageNameRaw) { alert('Vui lòng nhập tên trang'); return; }
                    if (!reasonRaw) { alert('Vui lòng nhập lý do'); return; }
                    const pageBase = pageNameRaw.replace(/ /g,'_');
                    const reason = reasonRaw + ' ~~~~';
                    bq.create(pageNameRaw, pageBase, reason);
                    $(this).dialog("close").remove();
                },
                "Hủy": function() {
                    $(this).dialog("close").remove();
                }
            }
        });
        $('#bq-pageName').focus();
    };
    bq.create = function(pageNameRaw, pageBase, reason) {
        const titleBase = `Wikipedia:Biểu quyết phục hồi trang/${pageBase}`;
        function buildContent(name, reason) {
            return `===[[:${name}]]===
:{{la|${name}}}
:({{Tìm nguồn|${name}}})
${reason}

:Hướng dẫn:
::Dùng {{tl|ph}} {{ph}} để bỏ phiếu phục hồi
::Dùng {{tl|kph}} {{kph}} để bỏ phiếu không phục hồi
::Dùng {{tl|yk}} {{yk}} để nêu ý kiến khác.

====Phục hồi====

====Không phục hồi====

====Ý kiến====`;
        }
        const content = buildContent(pageNameRaw, reason);
        function createUniquePage(baseTitle, count, callback) {
            const newTitle = count === 0 ? baseTitle : `${baseTitle} (lần ${count+1})`;
            new mw.Api().get({
                action: 'query',
                titles: newTitle
            }).done(function(data) {
                const pageId = Object.keys(data.query.pages)[0];
                if (data.query.pages[pageId].missing !== undefined) {
                    callback(newTitle);
                } else {
                    createUniquePage(baseTitle, count+1, callback);
                }
            });
        }
        createUniquePage(titleBase, 0, function(finalTitle) {
            new mw.Api().postWithEditToken({
                action: 'edit',
                title: finalTitle,
                text: content,
                summary: `Tạo biểu quyết phục hồi cho trang [[${pageNameRaw}]] ([[Thành viên:Yuki Shiromita/Blog/QuickDR|QuickDR]])`
            }).done(function() {
                mw.notify('Trang biểu quyết đã được tạo: ' + finalTitle, { type: 'success' });
                bq.appendToMain(finalTitle, pageNameRaw);
                window.location.href = mw.util.getUrl(finalTitle);
            }).fail(function(err) {
                console.error('Tạo trang thất bại:', err);
                mw.notify('Tạo trang thất bại! Xem console để biết chi tiết.', { type: 'error' });
            });
        });
    };
    bq.appendToMain = function(pageTitle, pageNameRaw) {
        const mainPage = 'Wikipedia:Biểu quyết phục hồi trang';
        const subpage = pageTitle.split('/').pop();
        const templateText = `\n{{Wikipedia:Biểu quyết phục hồi trang/${subpage}}}`;
        new mw.Api().get({
            action: 'query',
            titles: mainPage,
            prop: 'revisions',
            rvprop: 'content'
        }).done(function(data) {
            const pageId = Object.keys(data.query.pages)[0];
            const oldText = data.query.pages[pageId].revisions[0]['*'];
            const newText = oldText.replace(/(==\s*Đề nghị phục hồi\s*==)/, `$1\n${templateText}`);
            new mw.Api().postWithEditToken({
                action: 'edit',
                title: mainPage,
                text: newText,
                summary: `Thêm đề mục mới cho [[${pageNameRaw}]] vào trang biểu quyết phục hồi ([[Thành viên:Yuki Shiromita/Blog/QuickDR|QuickDR]])`
            }).done(function() {
                mw.notify('Đã thêm đề mục mới vào Wikipedia:Biểu quyết phục hồi trang.', { type: 'success' });
            }).fail(function() {
                mw.notify('Lỗi khi thêm đề mục mới vào Wikipedia:Biểu quyết phục hồi trang.', { type: 'error' });
            });
        });
    };
})();
//</nowiki>
