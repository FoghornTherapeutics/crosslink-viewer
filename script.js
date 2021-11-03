// <!-- Functions for Slidey panels -->

    helpShown = false;
    infoShown = false;
    legendShown = false;
    function toggleHelpPanel() {
        if (helpShown){
            hideHelpPanel();
        }
        else {
            showHelpPanel();
        }
    }

    function toggleInfoPanel() {
        if (infoShown){
            hideInfoPanel();
        }
        else {
            showInfoPanel();
        }
    }
    function toggleLegendPanel() {
        if (legendShown){
            hideLegendPanel();
        }
        else {
            showLegendPanel();
        }
    }

    function showHelpPanel() {
            helpShown = true;
            d3.select("#helpPanel").transition().style("height", "500px").style("top", "100px").duration(700);
    }
    function hideHelpPanel() {
            helpShown = false;
            d3.select("#helpPanel").transition().style("height", "0px").style("top", "-95px").duration(700);
    }
    function showInfoPanel() {
            infoShown = true;
            d3.select("#infoPanel").transition().style("height", "300px").style("bottom", "115px").duration(700);

    }
    function hideInfoPanel() {
            infoShown = false;
            d3.select("#infoPanel").transition().style("height", "0px").style("bottom", "-95px").duration(700);

    }
    function showLegendPanel() {
            legendShown = true;
            d3.select("#legendPanel").transition().style("height", "500px").style("top", "100px").duration(700);

    }
    function hideLegendPanel() {
            legendShown = false;
            d3.select("#legendPanel").transition().style("height", "0px").style("top", "-95px").duration(700);

    }



// <!-- Functions for XiNET -->

    var sliderDecimalPlaces = 1;
    function getMinScore(){
        if (xlv.scores){
            var powerOfTen = Math.pow(10, sliderDecimalPlaces);
            return (Math.floor(xlv.scores.min * powerOfTen) / powerOfTen)
                    .toFixed(sliderDecimalPlaces);
        }
    }
    function getMaxScore(){
        if (xlv.scores){
            var powerOfTen = Math.pow(10, sliderDecimalPlaces);
            return (Math.ceil(xlv.scores.max * powerOfTen) / powerOfTen)
                    .toFixed(sliderDecimalPlaces);
        }
    }
    function sliderChanged(){
        var slide = document.getElementById('slide');
        var powerOfTen = Math.pow(10, sliderDecimalPlaces);

        var cut = ((slide.value / 100)
                    * (getMaxScore() - getMinScore()))
                    + (getMinScore() / 1);
        cut = cut.toFixed(sliderDecimalPlaces);
        var cutoffLabel = document.getElementById("cutoffLabel");
        cutoffLabel.innerHTML = '(' + cut + ')';
        xlv.setCutOff(cut);
    }



// <!-- Dataset selection -->
    var globalConfig = null;
		  
		  
        var path_metadata = "./demo/data/metadata.csv";

        d3.csv(path_metadata, function(config) {
            globalConfig = config;
            console.log(globalConfig);

            // add path where it concatenates "./demo/data/" + file name as a string
            globalConfig.forEach(d => {
                d.path = "./demo/data/" + d.file + ".csv";
                d.path_customAnnot = "./demo/data/" + d.customAnnot + ".csv";
                });

            // create an array of the display_name to display in the dropdown menu
            const uniqueDisplay_name = Array.from(config.map(d => d.display_name)).sort();

            // Add option to the button (dropdown/search bar)
            d3.select("#dataSets")
                .selectAll('option')
                        .data(uniqueDisplay_name)
                    .enter()
                        .append('option')
                    .text(function (d) { return d; }) // text showed in the menu
                    .attr("value", function (d) { return d; }) // corresponding value returned by the button

            
            //  use select2
            $( "#dataSets" ).select2({
                data: globalConfig,
                containerCssClass: "search"
            });


            var targetDiv = document.getElementById('networkContainer');
            xlv = new xiNET.Controller(targetDiv);

            var targetDiv = document.getElementById('networkContainer');
            var messageDiv = document.getElementById('networkCaption');
            xlv = new xiNET.Controller(targetDiv);
            xlv.setMessageElement(messageDiv);
            loadData(globalConfig);
            changeAnnotations();
            xlv.showSelfLinks(document.getElementById('selfLinks').checked);
            xlv.showAmbig(document.getElementById('ambig').checked);

        });
        

        function loadData(config){
            var displayNameSelect = document.getElementById('dataSets').value;
            console.log(displayNameSelect);
            var dataSelected = config.filter(d => d.display_name.includes(displayNameSelect))[0];
            var path = dataSelected.path;
            document.getElementById('citation').innerHTML = dataSelected.cite;
            if (dataSelected.customAnnot){
                d3.text(dataSelected.customAnnot, "text/csv", function(annot) {
                    d3.text(path, "text/csv", function(text) {
                        xlv.clear();
                        xlv.readCSV(text, null, annot);
                        initSlider();
                    });
                });
            }
            else {
                d3.text(path, "text/csv", function(text) {
                    xlv.clear();
                    xlv.readCSV(text);
                    initSlider();
                });
            }
        };



        function changeAnnotations(){
            var annotationSelect = document.getElementById('annotationsSelect');
            xlv.setAnnotations(annotationSelect.options[annotationSelect.selectedIndex].value);
        };
        function initSlider(){
                        if (xlv.scores === null){
                    d3.select('#scoreSlider').style('display', 'none');
                }
                else {
                    document.getElementById('scoreLabel1').innerHTML = "Score:" + getMinScore();
                    document.getElementById('scoreLabel2').innerHTML = getMaxScore();
                    sliderChanged();
                    d3.select('#scoreSlider').style('display', 'inline-block');
                }
        };
					
	