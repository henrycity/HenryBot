var expect = require('chai').expect;
var striptags = require('striptags');
var translate = require('google-translate-api');

describe('translate()', function() {

    test('should translate a Finnish text to right English text', async (done) => {
        let finnishText = 'Pienen vilauksen lisäksi videolla kuullaan hieman hahmon motivaatiota sodanlietsomiselle,';
        let finnishTextEnglishTranslation = 'In addition to a small glimpse, the video is a little bit heard about the motivation of a figure for war-firing,';

        // const translation = await translate('finnishText');
        translate(finnishText, { from: 'fi', to: 'en' }).then(translation => {
            expect(translation).to.be.not.undefined;
            expect(translation.text).to.be.eql(finnishTextEnglishTranslation);
        }).catch(err => {
            console.error(err);
        });

        done()
    });

    test('should strip tags from translated text', async (done) => {
        let finnishText = 
            '<a href="https://example.com">tais olla samalta <strong>puljulta</strong> kun se <em>puludeittailu</em></a>';
        let finnishTextEnglishTranslation = 'not be the same pulse as it is pulverizing';

        translate(striptags(finnishText), { from: 'fi', to: 'en' }).then(translation => {
            expect(translation).to.be.not.undefined;
            expect(translation.text).to.be.eql(finnishTextEnglishTranslation);
        }).catch(err => {
            console.error(err);
        });

        done()
    });

});
