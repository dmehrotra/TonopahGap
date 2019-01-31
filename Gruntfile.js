const open = require('open');
const { execSync } = require('child_process')

module.exports = function(grunt) {

grunt.loadNpmTasks('grunt-contrib-compress');
grunt.loadNpmTasks('grunt-contrib-copy');
grunt.loadNpmTasks('grunt-contrib-uglify-es');
grunt.loadNpmTasks('grunt-contrib-imagemin');
grunt.loadNpmTasks('grunt-mocha-test');
grunt.loadNpmTasks('grunt-newer');
grunt.loadNpmTasks('grunt-exec');

grunt.initConfig({
    uglify: {
        all: {
            files: [
                {
                    dest: 'tonopah/inject.min.js',
                    src: [
                        "src/jquery.js",
                        "src/TonopahMap.js",
                        "src/inject_frame.js"
                    ]
                }
            ]
        }
    },
    copy: {
        all: {
            files: [{
                expand: true,
                src: [
                    'src/**/*.js',
                    'src/**/*.css',
                    'src/**/*.html',
                ],
                dest: 'tonopah'
            }]
        },
        manifest: {
            files: [{
                src: ['manifest_template.json'],
                dest: 'tonopah/manifest.json'
            }],
            options: {
                process: processManifestTemplate
            }
        }
    },
    exec: {
        chrome_extension_reload: '(./chrome-cli open chrome://extensions && ./chrome-cli reload && ./chrome-cli close) || echo "Skipping chrome reload"',
    },
    open: {
        gen_dir: 'tonopah',
        github_release: '',
        webstore: ''
    },
    imagemin: {
        dynamic: {
            files: [{
                expand: true,
                src: ['images/**/*.png'],
                dest: 'tonopah'
            }]
        }
    },

});

grunt.registerMultiTask('open', function() {
    open(this.data);
});

grunt.registerTask('build', [
    'uglify:all',
    'copy:all',
    'copy:manifest',
    'newer:imagemin']);

grunt.registerTask('dev', [
    'build',
    'exec:chrome_extension_reload'
]);



function processManifestTemplate(content) {
    let manifest = JSON.parse(content);
    function processObj(obj) {
        if (typeof obj === 'object') {
            for (o in obj) {
                if (obj[o] === '<%= all_google_maps_urls %>') {
                    obj[o] = getGoogleMapUrls();
                } else if (typeof obj[o] === 'object') {
                    processObj(obj[o]);
                }
            }
        }
    }
    processObj(manifest)
    return JSON.stringify(manifest, null, '  ');
}

function getGoogleMapUrls() {
    const GOOGLE_MAPS_CCTLDS = [
        "at", "au", "be", "br", "ca", "cf", "cg", "ch", "ci", "cl", "cn", "uk", "in", "jp", "th",
        "cz", "dj", "de", "dk", "ee", "es", "fi", "fr", "ga", "gm", "hk", "hr", "hu", "ie", "is",
        "it", "jp", "li", "lt", "lu", "lv", "mg", "mk", "mu", "mw", "nl", "no", "nz", "pl", "pt",
        "ro", "ru", "rw", "sc", "se", "sg", "si", "sk", "sn", "st", "td", "tg", "tr", "tw", "ua",
        "us"]

    const GOOGLE_MAPS_URL_FORMATS = [
        "*://www.google.{tld}/maps*",
        "*://www.google.com.{tld}/maps*",
        "*://www.google.co.{tld}/maps*",
        "*://maps.google.{tld}/*",
        "*://maps.google.com.{tld}/*",
        "*://maps.google.co.{tld}/*"
    ]

    const GOOGLE_MAPS_SPECIAL_URLS = [
        "*://www.google.com/maps*",
        "*://maps.google.com/*",
        "*://mapy.google.pl/*",
        "*://ditu.google.cn/*"
    ]


    let output = []
    for (tld of GOOGLE_MAPS_CCTLDS) {
        for (format of GOOGLE_MAPS_URL_FORMATS) {
            output.push(format.replace('{tld}', tld))
        }
    }
    output = output.concat(GOOGLE_MAPS_SPECIAL_URLS)
    return output
}


};
