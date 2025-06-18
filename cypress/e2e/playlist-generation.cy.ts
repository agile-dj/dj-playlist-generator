describe('Playlist Generation Tests', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  const testCases = [
    {
      name: 'High Danceability Party Playlist with Single Genre',
      params: {
        eventType: 'Party',
        danceability: 80,
        genres: ['brazil', 'deep-house']
      },
      expectations: {
        minDanceability: 0.7
      }
    },
    {
      name: 'Chill Playlist with Two Genres',
      params: {
        eventType: 'Bar Mitzvah',
        danceability: 30,
        popularity: 80,
        genres: ['acoustic', 'ambient']
      },
      expectations: {
        minDanceability: 0.4,
        minPopularity: 60
      }
    },
    {
      name: 'Mixed Party Playlist with Three Genres',
      params: {
        eventType: 'Birthday',
        danceability: 80,
        popularity: 80,
        genres: ['disco', 'electro', 'funk']
      },
      expectations: {
        minDanceability: 0.6,
        minPopularity: 65
      }
    },
    {
      name: 'Wedding Playlist with BPM Progression',
      params: {
        eventType: 'wedding',
        genres: ['pop', 'dance'],
        receptionTempo: 'slow',
        ceremonyTempo: 'medium',
        dancingTempo: 'fast'
      },
      expectations: {
        segmentBpmDiffs: {
          'Reception-ceremony': 15,
          'Dancing-Reception': 15
        }
      }
    }
  ]

  testCases.forEach(({ name, params, expectations }) => {
    it(`should generate ${name} with correct parameters`, () => {
      // Select event type
      cy.get('[data-cy="event-type-trigger"]').click()
      cy.get(`[data-cy="event-type-option-${params.eventType.toLowerCase()}"]`).click()

      // Set danceability
      cy.get('[data-cy="danceability-slider"]')
        .invoke('val', params.danceability)
        .trigger('change')

      // Set popularity
      if (params.popularity) {
        cy.get('[data-cy="popularity-slider"]')
          .invoke('val', params.popularity)
          .trigger('change')
      }

      // Select genres
      params.genres.forEach(genre => {
        cy.get('[data-cy="genre-select-trigger"]').click()
        cy.get(`[data-cy="genre-option-${genre.toLowerCase()}"]`).click()
      })

      // For wedding playlists, set segment tempos
      if (params.eventType === 'wedding') {
        // Set reception tempo
        cy.get('[data-cy="reception-tempo-trigger"]').click()
        cy.get(`[data-cy="tempo-option-${params.receptionTempo}"]`).click()

        // Set ceremony tempo
        cy.get('[data-cy="ceremony-tempo-trigger"]').click()
        cy.get(`[data-cy="tempo-option-${params.ceremonyTempo}"]`).click()

        // Set dancing tempo
        cy.get('[data-cy="dancing-tempo-trigger"]').click()
        cy.get(`[data-cy="tempo-option-${params.dancingTempo}"]`).click()
      } else {
        cy.contains('button', '1h').click()
      }

      // Generate playlist
      cy.get('[data-cy="generate-button"]').click()

      // Wait for playlist to be generated
      cy.get('[data-cy="song-list"]', { timeout: 15000 }).should('be.visible')

      // Get all songs and calculate averages
      cy.window().then((win) => {
        const songs = win.document.querySelectorAll('[data-cy="song-item"]')
        let totalDanceability = 0
        let totalPopularity = 0
        let count = 0

        songs.forEach((song) => {
          totalDanceability += parseFloat(song.getAttribute('data-danceability') || '0')
          totalPopularity += parseFloat(song.getAttribute('data-popularity') || '0')
          count++
        })

        const avgDanceability = totalDanceability / count
        const avgPopularity = totalPopularity / count

        // Log the averages for debugging
        cy.log(`Average Danceability: ${avgDanceability}`)

        // Verify the averages match our expectations
        if (expectations.minDanceability) {
          expect(avgDanceability).to.be.at.least(expectations.minDanceability)
        }

        if (expectations.minPopularity) {
          expect(avgPopularity).to.be.at.least(expectations.minPopularity)
        }

        // For wedding playlists, verify BPM differences between segments
        if (params.eventType === 'wedding' && expectations.segmentBpmDiffs) {
          interface SegmentData {
            total: number;
            count: number;
          }
          
          const segmentBpms = new Map<string, SegmentData>();
          
          // Calculate average BPM for each segment
          songs.forEach((song) => {
            const segment = song.getAttribute('data-segment') || '';
            const bpm = parseFloat(song.getAttribute('data-tempo') || '0');
            
            if (!segmentBpms.has(segment)) {
              segmentBpms.set(segment, { total: 0, count: 0 });
            }
            const segmentData = segmentBpms.get(segment)!;
            segmentData.total += bpm;
            segmentData.count += 1;
          });

          // Calculate averages
          const avgBpms = new Map(
            Array.from(segmentBpms.entries()).map(([segment, data]) => [
              segment,
              data.total / data.count
            ])
          );

          // Verify BPM differences
          Object.entries(expectations.segmentBpmDiffs).forEach(([segments, minDiff]) => {
            const [segment1, segment2] = segments.split('-');
            const bpm1 = avgBpms.get(segment1) || 0;
            const bpm2 = avgBpms.get(segment2) || 0;
            
            cy.log(`Average BPM for ${segment1}: ${bpm1}`);
            cy.log(`Average BPM for ${segment2}: ${bpm2}`);
            
            const diff = Math.abs(bpm1 - bpm2);
            expect(diff, `BPM difference between ${segment1} and ${segment2}`)
              .to.be.at.least(minDiff);
          });
        }

        // Verify we got songs
        expect(count).to.be.greaterThan(0)
      })
    })
  })
})
