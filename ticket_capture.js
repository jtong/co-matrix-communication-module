function ticket_capture(ctx,remotectx,trackX, trackY,trackSize) {
// 抓便签纸
    $('.snapshot').click(function () {


        var canvasID = 'canvas' + $('canvas').length;

        var newCanvas = document.createElement('canvas');
        newCanvas.width = trackSize;
        newCanvas.height = trackSize;

        var imageData = ctx.getImageData(trackX, trackY, trackSize, trackSize);//这里的trackX是在最早我删掉的那个好像跟远程stick有关的代码里被初始化的
        newCanvas.getContext('2d').putImageData(imageData, 0, 0);

        newCanvas.id = canvasID;
        $('body').append(newCanvas);

        // $('#'+canvasID).draggable({ cursor: "move", cursorAt: { top: trackSize, left: trackSize}, containment: '#note' });
        var $div = $('#note');
        $('#' + canvasID)
            .drag("start", function (ev, dd) {
                dd.limit = $div.offset();
                dd.limit.bottom = dd.limit.top + $div.outerHeight() - $(this).outerHeight();
                dd.limit.right = dd.limit.left + $div.outerWidth() - $(this).outerWidth();
            })
            .drag(function (ev, dd) {
                $(this).css({
                    top: Math.min(dd.limit.bottom, Math.max(dd.limit.top, dd.offsetY)),
                    left: Math.min(dd.limit.right, Math.max(dd.limit.left, dd.offsetX))
                });
            });
        $('#' + canvasID).css('cursor', 'move');
        $('#' + canvasID).css('position', 'absolute');
        $('#' + canvasID).css('z-index', '998');
        $('#' + canvasID).css('left', ((640 - trackX - trackSize) / 640) * $(document).width() * 0.68 + $(document).width() * 0.28 + 'px');
        $('#' + canvasID).css('top', (trackY / 480) * $(document).height() * 0.9 + 'px');
        $('#' + canvasID).css('width', trackSize * 2 + 'px');
        $('#' + canvasID).css('height', trackSize * 2 + 'px');
        $('#' + canvasID).css('border-radius', '10px');


        socket.emit('note', {
            'trackX': trackX,
            'trackY': trackY,
            'trackSize': trackSize
        });// 发的位置，让远程也拍一下，识别。在网络延迟下会出错


    });


    //** remote ticket
    socket.on('note', function (data) {

        var canvasID = 'canvas' + $('canvas').length;

        var newCanvas = document.createElement('canvas');
        newCanvas.width = data.trackSize;
        newCanvas.height = data.trackSize;

        var remoteImgData = remotectx.getImageData(data.trackX, data.trackY, data.trackSize, data.trackSize);

        newCanvas.getContext('2d').putImageData(remoteImgData, 0, 0);

        newCanvas.id = canvasID;

        $('body').append(newCanvas);

        var $div = $('#note');
        $('#' + canvasID)
            .drag("start", function (ev, dd) {
                dd.limit = $div.offset();
                dd.limit.bottom = dd.limit.top + $div.outerHeight() - $(this).outerHeight();
                dd.limit.right = dd.limit.left + $div.outerWidth() - $(this).outerWidth();
            })
            .drag(function (ev, dd) {
                $(this).css({
                    top: Math.min(dd.limit.bottom, Math.max(dd.limit.top, dd.offsetY)),
                    left: Math.min(dd.limit.right, Math.max(dd.limit.left, dd.offsetX))
                });
            });
        $('#' + canvasID).css('cursor', 'move');
        $('#' + canvasID).css('position', 'absolute');
        $('#' + canvasID).css('z-index', '998');
        $('#' + canvasID).css('left', ((640 - data.trackX - data.trackSize) / 640) * $(document).width() * 0.68 + $(document).width() * 0.28 + 'px');
        $('#' + canvasID).css('top', (data.trackY / 480) * $(document).height() * 0.9 + 'px');
        $('#' + canvasID).css('width', data.trackSize * 2 + 'px');
        $('#' + canvasID).css('height', data.trackSize * 2 + 'px');
        $('#' + canvasID).css('border-radius', '10px');
    });
}