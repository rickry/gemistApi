jQuery(document).ready(function ($) {
    const url = "https://live.rickstoit.nl/api/gkvhetlichtpunt/video";

    let dataItems = null,
        loadedGroup = null;

    loadData();


    $(document).on("click", ".group", function () {
        let id = $(this).attr('data-id')
        loadedGroup = dataItems[id]
        setVideos(loadedGroup)
    });

    $(document).on("click", ".video", function () {
        let id = $(this).attr('data-id')
        replayVideo(loadedGroup.videos[id])
    });

    $(document).on("click", ".back", function () {
        setGroups(dataItems)
    });

    function loadData() {
        $.getJSON(url, function (data) {
            setGroups(data);
            dataItems = data;
        });
    }

    function setVideos(data) {

        let items = [];
        $('.back').show()

        items.push("<tr><td></td><td>Titel</td><td>Hits</td></tr>");

        $.each(data.videos, function (key, val) {
            items.push("<tr class='video' data-id='" + key + "'><td><img src='" + val.thumbnail + "' alt='Thumbnail'/></td><td>" + val.title + "</td><td>" + val.hits + "</td></tr>");
        });

        $('#box').empty()

        $("<h1>", {
            "class": "groupTitle",
            text: data.date
        }).appendTo("#box");

        $("<table>", {
            "class": "videos",
            html: items.join("")
        }).appendTo("#box");

    }

    function setGroups(data) {
        $('.back').hide()
        $('#box').empty()

        let items = [];
        items.push("<tr><td></td><td>Titel</td><td>Videos</td></tr>");
        $.each(data, function (key, val) {
            items.push("<tr class='group' data-id='" + key + "'><td><img src='" + val.videos[0].thumbnail + "' alt='Thumbnail'/></td><td>" + val.date + "</td><td>" + val.counts + "</td></tr>");
        });


        $("<table>", {
            "class": "groups",
            html: items.join("")
        }).appendTo("#box");

    }

    function replayVideo(data) {
        const video = document.querySelector("video");
        const source = data.path;

        let details = `<tr><td>Dominee</td><td>${data.details.pastor}</td></tr>
                <tr><td>Ouderling</td><td>${data.details.elder}</td></tr>
                <tr><td>Band</td><td>${data.details.band}</td></tr>
                <tr><td>Collecte</td><td>${data.details.collection}</td></tr>
                <tr><td>Techniek</td><td>${data.details.technic}</td></tr>`


        $("<table>", {
            "class": "details",
            html: details
        }).appendTo(".videoDetails");

        $('.player_container').show()
        // For more options see: https://github.com/sampotts/plyr/#options
        const defaultOptions = {};

        if (Hls.isSupported()) {
            // For more Hls.js options, see https://github.com/dailymotion/hls.js
            const hls = new Hls();
            hls.loadSource(source);

            // From the m3u8 playlist, hls parses the manifest and returns
            // all available video qualities. This is important, in this approach,
            // we will have one source on the Plyr player.
            hls.on(Hls.Events.MANIFEST_PARSED, function (event, data) {

                // Transform available levels into an array of integers (height values).
                const availableQualities = hls.levels.map((l) => l.height)

                // Add new qualities to option
                defaultOptions.quality = {
                    default: availableQualities[0],
                    options: availableQualities,
                    // this ensures Plyr to use Hls to update quality level
                    // Ref: https://github.com/sampotts/plyr/blob/master/src/js/html5.js#L77
                    forced: true,
                    onChange: (e) => updateQuality(e),
                }

                // Initialize new Plyr player with quality options
                const player = new Plyr(video, defaultOptions);
            });
            hls.attachMedia(video);
            window.hls = hls;
        } else {
            // default options with no quality update in case Hls is not supported
            const player = new Plyr(video, defaultOptions);
        }

        function updateQuality(newQuality) {
            window.hls.levels.forEach((level, levelIndex) => {
                if (level.height === newQuality) {
                    console.log("Found quality match with " + newQuality);
                    window.hls.currentLevel = levelIndex;
                }
            });
        }
    }
});