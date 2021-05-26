import React from 'react';
import { mount } from 'enzyme';
import KitsuResultCard from 'components/KitsuResultCard';
import { fetchKitsuTitleSearch } from 'services/Kitsu';
import { kimiNoNaWaSearchQuery } from 'utils/Constants';

describe('KitsuResultCard', () => {
    it('should ', async () => {
        const kimiNoNaWaResponse = await fetchKitsuTitleSearch(kimiNoNaWaSearchQuery);
        const firstResult = kimiNoNaWaResponse.data[0];
        const renderedResultCardForFirstEntry = mount(<KitsuResultCard kitsuResult={firstResult} />);
        const renderedTitle = renderedResultCardForFirstEntry.find('h5 Anchor').text();

        expect(renderedTitle).toEqual(firstResult.attributes.canonicalTitle);
    });
});
