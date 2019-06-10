//      xiNET interaction viewer
//      Copyright 2014 Rappsilber Laboratory
//
//      This product includes software developed at
//      the Rappsilber Laboratory (http://www.rappsilberlab.org/).
//
//      author: Colin Combe, Josh Heimbach
//
//		NaryLink.js
//		graphically represents n-ary interactions


NaryLink.naryColours = d3.scale.ordinal().range(colorbrewer.Paired[6]); //d3.scale.category20c();//d3.scale.ordinal().range(colorbrewer.Paired[12]);//
NaryLink.orbitNodeCount = 16;
NaryLink.orbitRadius = 20;

NaryLink.prototype = new Link();

function NaryLink(id, xlvController) {
    this.id = id;
    this.evidences = d3.map();
    this.renderedParticipants = new Array();
    this.leaves = this.renderedParticipants; // temp (?) for cola
    this.sequenceLinks = d3.map();
    this.binaryLinks = d3.map();
    this.unaryLinks = d3.map();
    this.controller = xlvController;
    this.tooltip = this.id;
    //used to avoid some unnecessary manipulation of DOM
    this.initSVG();
}

NaryLink.prototype.initSVG = function() {
    this.path = document.createElementNS(this.controller.svgns, "path");
    //~ if (this.controller.expand === false){
    this.path.setAttribute('fill', NaryLink.naryColours(this.id));
    //~ }
    //~ else {
    //this.path.setAttribute('fill', '#70BDBD');
    //~ }
    this.path.setAttribute('fill-opacity', 0.3);

    //set the events for it
    var self = this;
    this.path.onmousedown = function(evt) {
        self.mouseDown(evt);
    };
    this.path.onmouseover = function(evt) {
        self.mouseOver(evt);
    };
    this.path.onmouseout = function(evt) {
        self.mouseOut(evt);
    };
    this.path.ontouchstart = function(evt) {
        self.touchStart(evt);
    };
};

NaryLink.prototype.showHighlight = function(show) {
    this.highlightMolecules(show);
};

NaryLink.prototype.check = function() {
    this.show();
    return true;
};

NaryLink.prototype.show = function() {
    this.path.setAttribute("stroke-width", this.controller.z * 1);
    this.setLinkCoordinates();
    this.controller.groupsSVG.appendChild(this.path);
    d3.select(this.path).style("display", null);
};

NaryLink.prototype.hide = function() {
    d3.select(this.path).style("display", "none");
    //    this.controller.groupsSVG.removeChild(this.path);
};

NaryLink.prototype.setLinkCoordinates = function() {
    // Uses d3.geom.hull to calculate a bounding path around an array of vertices
    var calculateHullPath = function(values) {
        var calced = d3.geom.hull(values);
        // self.hull = calced;//hack?
        return "M" + calced.join("L") + "Z";
    };
    var self = this; // TODO: - tidy hack above?
    var mapped = NaryLink.orbitNodes(this.getMappedCoordinates());
    var hullValues = calculateHullPath(mapped);
    if (hullValues) {
        this.path.setAttribute('d', hullValues);
    }
    if (this.complex) {
        this.complex.setAllLinkCoordinates();
    }
};

NaryLink.prototype.getMappedCoordinates = function() {
    var renderedParticipants = this.renderedParticipants;
    var mapped = new Array();
    var rpCount = renderedParticipants.length;
    for (var i = 0; i < rpCount; i++) {
        var rp = renderedParticipants[i];
        if (rp.hidden == false) {
            if (rp.type == 'complex') {
                mapped = mapped.concat(NaryLink.orbitNodes(rp.naryLink.getMappedCoordinates()));
            } else if (rp.form === 1) {
                var start = rp.getResidueCoordinates(0);
                var end = rp.getResidueCoordinates(rp.participant.size);
                if (!isNaN(start[0]) && !isNaN(start[1]) &&
                    !isNaN(end[0]) && !isNaN(end[1])) {
                    mapped.push(start);
                    mapped.push(end);
                } else {
                    mapped.push(rp.getPosition());
                }
            } else {
                mapped.push(rp.getPosition());
            }
        }
    }
    return mapped;
}

//'orbit' nodes - several nodes around interactor positions to give margin
NaryLink.orbitNodes = function(mapped) {
    var orbitNodes = new Array();
    var mc = mapped.length;
    for (var mi = 0; mi < mc; mi++) {
        var m = mapped[mi];
        for (var o = 0; o < NaryLink.orbitNodeCount; o++) {
            var angle = (360 / NaryLink.orbitNodeCount) * o;
            var p = [m[0] + NaryLink.orbitRadius, m[1]];
            orbitNodes.push(Molecule.rotatePointAboutPoint(p, m, angle));
        }
    }
    return orbitNodes;
}
