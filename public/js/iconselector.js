/*globals R, document, window, IconSelect*/

window.onload = function () {
    var iconSelect;
    var selectedText = document.getElementById('cursor-id');
    if (!selectedText) {
        console.log('no icon selector');
        return;
    }

    var icons = [];
    var GameCursors = R.range(1, 55);

    R.forEach(function (cursor) {
        icons.push({
            'iconFilePath': '/img/cursors/' + cursor + '.png',
            'iconValue': cursor
        });
    })(GameCursors);



    iconSelect = new IconSelect('my-icon-select', {
        'selectedIconWidth': 48,
        'selectedIconHeight': 42,
        'selectedBoxPadding': 0,
        'iconsWidth': 48,
        'iconsHeight': 42,
        'boxIconSpace': 0,
        'vectoralIconNumber': 14,
        'horizontalIconNumber': 14,
    });
    iconSelect.refresh(icons);
    iconSelect.setSelectedIndex(Number(selectedText.value) - 1); // index = value -1

    document.getElementById('my-icon-select').addEventListener('changed', function () {
        selectedText.value = iconSelect.getSelectedValue();
        console.log('icon changed', selectedText.value);
    });
};
