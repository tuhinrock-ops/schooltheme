  (function() {
    'use strict';

    /* ============================================================
       UTILITY HELPERS
    ============================================================ */
    var BANGLA_NUMS = {'0':'০','1':'১','2':'২','3':'৩','4':'৪','5':'৫','6':'৬','7':'৭','8':'৮','9':'৯'};
    function toBangla(n) {
      return String(n).replace(/[0-9]/g, function(d){ return BANGLA_NUMS[d]; });
    }

    function getFirstImage(html) {
      if (!html) return null;
      var m = /<img[^>]+src="([^">]+)"/.exec(html);
      return m ? m[1] : null;
    }

    function getSnippet(html) {
      if (!html) return '';
      return html.replace(/(<([^>]+)>)/ig, '').substring(0, 145) + '…';
    }

    function fetchJSON(url) {
      return fetch(url).then(function(r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      });
    }

    /* ============================================================
       CONTACT ICON MAPPER
    ============================================================ */
    function initContactIcons() {
      document.querySelectorAll('.dynamic-contact-list a').forEach(function(a) {
        var href = (a.getAttribute('href') || '').toLowerCase();
        var name = (a.getAttribute('data-name') || '').toLowerCase();
        
        // This is the default icon if no keywords match
        var icon = 'fa-map-marker-alt'; 

        // Check for specific keywords and assign matching Font Awesome icons
        if (href.indexOf('tel:') > -1 || name.indexOf('ফোন') > -1 || name.indexOf('মোবাইল') > -1) {
          icon = 'fa-phone-alt';
        } 
        else if (href.indexOf('mailto:') > -1 || name.indexOf('ইমেইল') > -1 || name.indexOf('email') > -1) {
          icon = 'fa-envelope';
        } 
        else if (name.indexOf('সময়') > -1 || name.indexOf('time') > -1) {
          icon = 'fa-clock';
        } 
        else if (name.indexOf('ইআইএন') > -1 || name.indexOf('eiin') > -1) {
          icon = 'fa-id-badge'; // Icon for EIIN Number
        } 
        else if (name.indexOf('এমপিও') > -1 || name.indexOf('mpo') > -1) {
          icon = 'fa-hashtag'; // Icon for MPO Number
        }

        a.insertAdjacentHTML('afterbegin', '<i aria-hidden="true" class="fas ' + icon + '" style="color:var(--primary);margin-right:7px;width:14px;text-align:center;flex-shrink:0;"></i>');
      });
    }

    /* ============================================================
       SOCIAL ICON MAPPER
    ============================================================ */
    function initSocialIcons() {
      document.querySelectorAll('.dynamic-social-list a').forEach(function(a) {
        var name = (a.getAttribute('data-name') || '').toLowerCase();
        var iconClass = 'fas fa-link', colorClass = '';
        if      (name.indexOf('facebook') > -1)  { iconClass = 'fab fa-facebook-f';  colorClass = 'fb-icon'; }
        else if (name.indexOf('twitter')  > -1)  { iconClass = 'fab fa-twitter';     colorClass = 'tw-icon'; }
        else if (name.indexOf('instagram')> -1)  { iconClass = 'fab fa-instagram';   colorClass = 'ig-icon'; }
        else if (name.indexOf('youtube')  > -1)  { iconClass = 'fab fa-youtube';     colorClass = 'yt-icon'; }
        else if (name.indexOf('linkedin') > -1)  { iconClass = 'fab fa-linkedin-in'; colorClass = 'li-icon'; }
        else if (name.indexOf('whatsapp') > -1)  { iconClass = 'fab fa-whatsapp';    colorClass = 'wa-icon'; }
        if (colorClass) a.classList.add(colorClass);
        a.innerHTML = '<i aria-hidden="true" class="' + iconClass + '"></i>';
      });
    }

    /* ============================================================
       MOBILE NAVIGATION
    ============================================================ */
  function initMobileNav() {
      var mainNav    = document.getElementById('main-nav');
      var overlay    = document.getElementById('menu-overlay');
      var toggle     = document.getElementById('mobile-toggle');
      var isOpen     = false;

      function openMenu() {
        if (!mainNav) return;
        isOpen = true;
        mainNav.classList.add('active');
        if (overlay) overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        if (toggle) toggle.setAttribute('aria-expanded', 'true');
      }
      function closeMenu() {
        isOpen = false;
        if (mainNav) mainNav.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
        document.body.style.overflow = '';
        if (toggle) toggle.setAttribute('aria-expanded', 'false');
      }
      function toggleMenu() { isOpen ? closeMenu() : openMenu(); }

      if (toggle)  toggle.addEventListener('click', toggleMenu);
      if (overlay) overlay.addEventListener('click', closeMenu);

      // Close on Escape key
      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && isOpen) closeMenu();
      });

      // Build smart dropdown menu from LinkList
      var menu = document.getElementById('dynamic-menu');
      if (!menu) return;

      // Insert mobile header
      var mobileHeader = document.createElement('div');
      mobileHeader.className = 'mobile-menu-header';
      mobileHeader.innerHTML = '<span>মেনু</span><button class="mobile-close" id="mobile-close" aria-label="মেনু বন্ধ করুন" type="button"><i class="fas fa-times"></i></button>';
      menu.parentNode.insertBefore(mobileHeader, menu);
      var closeBtn = document.getElementById('mobile-close');
      if (closeBtn) closeBtn.addEventListener('click', closeMenu);

      var items = Array.from(menu.children);
      var currentParent = null;

      items.forEach(function(li) {
        var a = li.querySelector('a');
        if (!a) return;
        var text = a.textContent.trim();

        if (text.startsWith('_')) {
          a.textContent = text.substring(1).trim();
          if (currentParent) {
            var dropdown = currentParent.querySelector('.dropdown-menu');
            if (!dropdown) {
              currentParent.classList.add('has-dropdown');
              dropdown = document.createElement('ul');
              dropdown.className = 'dropdown-menu';
              currentParent.appendChild(dropdown);

              var expandBtn = document.createElement('button');
              expandBtn.className = 'menu-expand';
              expandBtn.type = 'button';
              expandBtn.setAttribute('aria-expanded', 'false');
              expandBtn.setAttribute('aria-label', 'সাব-মেনু টগল করুন');
              expandBtn.innerHTML = '<i aria-hidden="true" class="fas fa-chevron-down"></i>';
              currentParent.insertBefore(expandBtn, dropdown);

              // FIX: Use DOM traversal to guarantee we open the exact menu clicked
              expandBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                e.preventDefault();
                var parentLi = this.parentElement;
                var dropMenu = parentLi.querySelector('.dropdown-menu');
                var isExpanded = parentLi.classList.contains('open');
                
                parentLi.classList.toggle('open', !isExpanded);
                if (dropMenu) dropMenu.classList.toggle('active', !isExpanded);
                this.setAttribute('aria-expanded', String(!isExpanded));
              });
            }
            dropdown.appendChild(li);
          }
        } else {
          currentParent = li;
        }
      });
    }

    /* ============================================================
       LIVE SEARCH
    ============================================================ */
function initLiveSearch() {
	var mobileTopBar = document.getElementById('mobile-top-bar');
      var mobileToggleBtn = document.getElementById('mobile-search-toggle');
      var mobileInput = document.getElementById('mobile-search-input');
      
      // Top Bar Toggle Interaction
      if (mobileToggleBtn && mobileTopBar) {
        mobileToggleBtn.addEventListener('click', function(e) {
          e.stopPropagation();
          mobileTopBar.classList.toggle('search-active');
          
          var icon = mobileToggleBtn.querySelector('i');
          if (mobileTopBar.classList.contains('search-active')) {
            // Change to X and focus input
            icon.className = 'fas fa-times';
            if (mobileInput) mobileInput.focus();
          } else {
            // Change back to magnifying glass
            icon.className = 'fas fa-search';
            if (mobileInput) mobileInput.value = ''; // clear input on close
          }
        });
      }
      var input   = document.getElementById('live-search-input');
      var results = document.getElementById('live-search-results');
      var searchWrap = document.querySelector('.live-search-wrap');
      var mobileToggleBtn = document.getElementById('mobile-search-toggle');
      if (!input || !results) return;

      var timer;

      // Mobile Toggle Logic
      if (mobileToggleBtn && searchWrap) {
        mobileToggleBtn.addEventListener('click', function(e) {
          e.stopPropagation();
          searchWrap.classList.toggle('show-on-mobile');
          if (searchWrap.classList.contains('show-on-mobile')) {
            input.focus();
          }
        });
      }

      input.addEventListener('input', function() {
        clearTimeout(timer);
        var q = this.value.trim();
        if (q.length < 2) { results.classList.remove('active'); return; }

        results.classList.add('active');
        results.innerHTML = '<div class="search-loading"><i class="fas fa-circle-notch fa-spin" style="margin-right:6px;"></i> অনুসন্ধান করা হচ্ছে...</div>';

        timer = setTimeout(function() {
          fetchJSON('/feeds/posts/summary?alt=json&q=' + encodeURIComponent(q) + '&max-results=5')
            .then(function(data) {
              if (!data.feed || !data.feed.entry) {
                results.innerHTML = '<div class="search-loading">কোনো ফলাফল পাওয়া যায়নি।</div>';
                return;
              }
              var html = '';
              data.feed.entry.forEach(function(entry) {
                var title   = entry.title.$t;
                var linkObj = entry.link.find(function(l){ return l.rel === 'alternate'; });
                var link    = linkObj ? linkObj.href : '#';
                var imgHtml = entry.media$thumbnail
                  ? '<img src="' + entry.media$thumbnail.url + '" alt="" loading="lazy">'
                  : '<div style="width:48px;height:48px;border-radius:8px;background:var(--primary);display:flex;align-items:center;justify-content:center;color:#fff;font-size:18px;flex-shrink:0;"><i class=\'fas fa-image\' aria-hidden=\'true\'></i></div>';
                html += '<a href="' + link + '" class="search-item">' + imgHtml + '<div class="search-item-info"><h4>' + title + '</h4></div></a>';
              });
              html += '<a href="/search?q=' + encodeURIComponent(q) + '" class="search-loading" style="display:block;border-top:1px solid var(--border-light);color:var(--primary);">সকল ফলাফল দেখুন &raquo;</a>';
              results.innerHTML = html;
            })
            .catch(function() {
              results.innerHTML = '<div class="search-loading">ফলাফল পেতে সমস্যা হয়েছে।</div>';
            });
        }, 380);
      });

      // Close dropdowns on outside click
      document.addEventListener('click', function(e) {
        if (results && !e.target.closest('.live-search-wrap')) {
          results.classList.remove('active');
        }
        if (searchWrap && !e.target.closest('.live-search-wrap') && !e.target.closest('#mobile-search-toggle')) {
          searchWrap.classList.remove('show-on-mobile');
        }
      });
    }

    /* ============================================================
       SCROLL EVENTS (Reading Progress, Header, Back-to-Top)
    ============================================================ */
    function initScrollEvents() {
      var header   = document.getElementById('site-header');
      var progress = document.getElementById('reading-progress');
      var btt      = document.getElementById('back-to-top');

      function onScroll() {
        var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        var docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        var pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

        if (progress) progress.style.width = Math.min(pct, 100) + '%';
        if (header)   header.classList.toggle('scrolled', scrollTop > 10);
        if (btt)      btt.classList.toggle('active', scrollTop > 300);
      }

      window.addEventListener('scroll', onScroll, { passive: true });

      if (btt) {
        btt.addEventListener('click', function() {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
      }
    }

    /* ============================================================
       READING TIME CALCULATOR
    ============================================================ */
    function initReadingTime() {
      document.querySelectorAll('.post-body').forEach(function(body) {
        var id      = body.id.replace('post-body-', '');
        var rtEl    = document.getElementById('read-time-' + id);
        if (!rtEl) return;
        var words   = (body.innerText || body.textContent || '').trim().split(/\s+/).length;
        var mins    = Math.max(1, Math.ceil(words / 200));
        rtEl.innerHTML = '<i aria-hidden="true" class="far fa-clock" style="margin-right:4px;"></i>' + toBangla(mins) + ' মিনিট পাঠ';
      });
    }

    /* ============================================================
       TABLE ENHANCEMENTS (Shortcode + Responsive wrapper)
    ============================================================ */
	/* ============================================================
       TABLE ENHANCEMENTS & SMART YEAR SORTING
    ============================================================ */
    window.sortTableByYear = function(table) {
      var BANGLA_NUMS = {'০':'0','১':'1','২':'2','৩':'3','৪':'4','৫':'5','৬':'6','৭':'7','৮':'8','৯':'9'};
      function toEnglishNumbers(str) { return str.replace(/[০-৯]/g, function(d) { return BANGLA_NUMS[d]; }); }

      var tbody = table.querySelector('tbody');
      if (!tbody) return;
      var rows = Array.from(tbody.querySelectorAll('tr'));
      if (rows.length < 2) return;

      var yearColIndex = -1;
      var yearRegex = /([0-9]{4}|[০-৯]{4})/;

      // Detect which column contains years
      var firstRowCells = rows[0].querySelectorAll('td');
      firstRowCells.forEach(function(cell, index) {
        if (yearRegex.test(cell.textContent.trim())) yearColIndex = index;
      });

      // Fallback: Check headers
      if (yearColIndex === -1) {
        table.querySelectorAll('th').forEach(function(th, index) {
          var text = th.textContent.trim().toLowerCase();
          if (text.indexOf('সাল') > -1 || text.indexOf('বছর') > -1 || text.indexOf('year') > -1 || text.indexOf('হইতে') > -1) yearColIndex = index;
        });
      }

      if (yearColIndex !== -1) {
        // Sort Rows Descending (Newest first)
        rows.sort(function(a, b) {
          var textA = toEnglishNumbers((a.querySelectorAll('td, th')[yearColIndex] || {}).textContent || '');
          var textB = toEnglishNumbers((b.querySelectorAll('td, th')[yearColIndex] || {}).textContent || '');
          var matchA = textA.match(/(\d{4})/);
          var matchB = textB.match(/(\d{4})/);
          
          var yearA = matchA ? parseInt(matchA[1], 10) : 0;
          var yearB = matchB ? parseInt(matchB[1], 10) : 0;
          return yearB - yearA; 
        });

        // Re-append sorted rows
        rows.forEach(function(row) { tbody.appendChild(row); });

        // Recalculate Serial Numbers (Assumes column 0 contains serials)
        rows.forEach(function(row, index) {
          var firstCell = row.querySelector('td');
          if(firstCell && /^[0-9০-৯]+$/.test(firstCell.textContent.trim())) {
             var engNum = (index + 1).toString();
             firstCell.textContent = engNum.replace(/[0-9]/g, function(d){
                 return {'0':'০','1':'১','2':'২','3':'৩','4':'৪','5':'৫','6':'৬','7':'৭','8':'৮','9':'৯'}[d];
             });
          }
        });
      }
    };

    function initTables() {
      document.querySelectorAll('.post-body').forEach(function(body) {
        var html = body.innerHTML;
        if (html.indexOf('[table]') > -1 && html.indexOf('[/table]') > -1) {
          html = html.replace(/(?:<p>|<div>)?\s*\[table\]\s*(?:<\/p>|<\/div>|<br\s*\/?>)?([\s\S]*?)(?:<p>|<div>|<br\s*\/?>)?\s*\[\/table\]\s*(?:<\/p>|<\/div>)?/gi, function(_, content) {
            var rawText = content.replace(/<br\s*\/?>/gi, '\n').replace(/<\/p>|<\/div>/gi, '\n');
            var rows = rawText.split('\n').map(function(r){ return r.trim(); }).filter(Boolean);
            if (!rows.length) return '';

            var out = '<div class="table-responsive-wrapper"><table class="styled-table" style="width:100%;min-width:560px;border-collapse:collapse;text-align:left;font-size:14px;">';
            rows.forEach(function(row, ri) {
              var cols = row.split('|').map(function(c){ return c.trim(); });
              if (ri === 0) {
                out += '<thead><tr style="background:#e8f0fb;">';
                cols.forEach(function(col, ci) {
                  var align = (ci === 0 || ci === cols.length - 1) ? 'text-align:center;' : '';
                  out += '<th style="padding:11px 14px;border:1px solid #cce0f5;' + align + '">' + col.replace(/<[^>]+>/g, '') + '</th>';
                });
                out += '</tr></thead><tbody>';
              } else {
                out += '<tr style="border-bottom:1px solid #eee;">';
                cols.forEach(function(col, ci) {
                  var align = (ci === 0 || ci === cols.length - 1) ? 'text-align:center;' : '';
                  var isRawImg = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(col);
                  if (isRawImg) {
                    col = '<img src="' + col + '" alt="ছবি" style="width:72px!important;height:100px!important;min-width:100px!important;object-fit:cover!important;border:2px solid #ddd!important;border-radius:50%!important;margin:0 auto!important;display:block!important;"/>';
                  } else if (col.indexOf('<img') > -1) {
                    col = col.replace(/<img/gi, '<img style="width:100px!important;height:100px!important;object-fit:cover!important;border:2px solid #ddd!important;border-radius:50%!important;margin:0 auto!important;display:block!important;"');
                  } else if (!col) {
                    col = '-';
                  }
                  out += '<td style="padding:11px 14px;border:1px solid #eee;' + align + '">' + col + '</td>';
                });
                out += '</tr>';
              }
            });
            out += '</tbody></table></div>';
            return out;
          });
          body.innerHTML = html;
        }

        // Wrap existing tables and sort them
        body.querySelectorAll('table').forEach(function(table) {
          if (!table.closest('.table-responsive-wrapper')) {
            table.removeAttribute('width');
            table.style.width = '100%';
            table.style.minWidth = '560px';
            table.querySelectorAll('td, th').forEach(function(cell) {
              cell.removeAttribute('width');
            });
            var wrapper = document.createElement('div');
            wrapper.className = 'table-responsive-wrapper';
            table.parentNode.insertBefore(wrapper, table);
            wrapper.appendChild(table);
          }
          // Call the smart sorter on standard post tables
          window.sortTableByYear(table); 
        });
      });
      
      // Also apply sorting to the dynamically generated Superintendent table
      var suptTable = document.getElementById('superintendent-tbody');
      if(suptTable) {
         window.sortTableByYear(suptTable.closest('table'));
      }
    }
	
    /* ============================================================
       GALLERY GRID AUTO-LAYOUT (for posts tagged "Gallery")
    ============================================================ */
    function initGalleryLayout() {
      document.querySelectorAll('.post-article').forEach(function(article) {
        var tags = Array.from(article.querySelectorAll('.tags a'));
        var galleryLabels = ['gallery', 'গ্যালারি', 'ফটো গ্যালারি'];
        var isGallery = tags.some(function(t){ return galleryLabels.indexOf(t.textContent.trim().toLowerCase()) > -1; });
        if (!isGallery) return;

        var body = article.querySelector('.post-body');
        if (!body) return;
        var separators = Array.from(body.querySelectorAll('.separator'));
        if (separators.length < 1) return;

        var grid = document.createElement('div');
        grid.className = 'post-gallery-grid';
        separators[0].parentNode.insertBefore(grid, separators[0]);
        separators.forEach(function(sep) { grid.appendChild(sep); });
      });
    }

    /* ============================================================
       LABEL CARD BUILDER (Dashboard)
    ============================================================ */
    var LABEL_META = {
      'About':              { icon: 'fas fa-building',    color: 'var(--primary)',    name: 'সম্পর্কে' },
      'Academic Info':      { icon: 'fas fa-book-reader', color: 'var(--secondary)',  name: 'একাডেমিক তথ্য' },
      'Student Corner':     { icon: 'fas fa-download',    color: 'var(--tertiary)',   name: 'শিক্ষার্থী কর্নার' },
      'Administration':     { icon: 'fas fa-user-tie',    color: 'var(--quaternary)', name: 'প্রশাসন' },
      'সম্পর্কে':           { icon: 'fas fa-building',    color: 'var(--primary)',    name: 'সম্পর্কে' },
      'একাডেমিক তথ্য':     { icon: 'fas fa-book-reader', color: 'var(--secondary)',  name: 'একাডেমিক তথ্য' },
      'শিক্ষার্থী কর্নার': { icon: 'fas fa-download',    color: 'var(--tertiary)',   name: 'শিক্ষার্থী কর্নার' },
      'প্রশাসন':           { icon: 'fas fa-user-tie',    color: 'var(--quaternary)', name: 'প্রশাসন' }
    };

    function fetchLabelCard(label, targetId) {
      var container = document.getElementById(targetId);
      if (!container) return;

      fetchJSON('/feeds/posts/default/-/' + encodeURIComponent(label) + '?alt=json&max-results=4')
        .then(function(data) {
          if (!data.feed || !data.feed.entry || !data.feed.entry.length) return;
          var meta = LABEL_META[label] || { icon: 'fas fa-folder-open', color: 'var(--primary)', name: label };

          var html = '<div class="label-card">'
            + '<div class="label-card-header">'
            + '<div class="header-title-wrap">'
            + '<i aria-hidden="true" class="' + meta.icon + '" style="background:' + meta.color + ';"></i>'
            + '<h3 style="color:' + meta.color + ';">' + meta.name + '</h3>'
            + '</div>'
            + '<a href="/search/label/' + encodeURIComponent(label) + '" class="label-view-all" style="color:' + meta.color + ';">সবগুলো দেখুন</a>'
            + '</div>'
            + '<ul class="label-card-list">';

          data.feed.entry.forEach(function(entry) {
            var title   = entry.title ? entry.title.$t : 'Untitled';
            var linkObj = entry.link ? entry.link.find(function(l){ return l.rel === 'alternate'; }) : null;
            var link    = linkObj ? linkObj.href : '#';
            html += '<li><i aria-hidden="true" class="fas fa-arrow-right" style="color:' + meta.color + ';"></i><a href="' + link + '">' + title + '</a></li>';
          });

          html += '</ul></div>';
          container.insertAdjacentHTML('beforeend', html);
        })
        .catch(function(e) { console.warn('Label card error (' + label + '):', e); });
    }

    /* ============================================================
       SECTION DATA FETCHER (Generic)
    ============================================================ */
    function fetchSection(label, max, type, targetId) {
      var container = document.getElementById(targetId);
      if (!container) return;

      fetchJSON('/feeds/posts/default/-/' + encodeURIComponent(label) + '?alt=json&max-results=' + max)
        .then(function(data) {
          var entries = (data.feed && data.feed.entry) ? data.feed.entry : [];

          if (!entries.length) {
            if (type === 'notice') {
              container.innerHTML = '<li style="justify-content:center;padding:20px;color:var(--text-muted);">"নোটিশ" লেবেলের কোনো পোস্ট পাওয়া যায়নি।</li>';
            } else if (type === 'slider') {
              container.innerHTML = '<div style="padding:56px;text-align:center;color:var(--text-muted);">স্লাইডারের জন্য কোনো পোস্ট পাওয়া যায়নি। "স্লাইডার" লেবেল ব্যবহার করুন।</div>';
            }
            return;
          }

          // Sort teachers by Order tag
          if (type === 'teachers') {
            entries.sort(function(a, b) {
              var ca = (a.content && a.content.$t) || (a.summary && a.summary.$t) || '';
              var cb = (b.content && b.content.$t) || (b.summary && b.summary.$t) || '';
              var ma = ca.match(/(?:Order|Sort)s?:\s*(\d+)/i);
              var mb = cb.match(/(?:Order|Sort)s?:\s*(\d+)/i);
              return (ma ? parseInt(ma[1], 10) : 9999) - (mb ? parseInt(mb[1], 10) : 9999);
            });
          }

          var html = '';

          entries.forEach(function(entry) {
            var title   = entry.title ? entry.title.$t : 'Untitled';
            var linkObj = entry.link ? entry.link.find(function(l){ return l.rel === 'alternate'; }) : null;
            var link    = linkObj ? linkObj.href : '#';
            var raw     = (entry.content && entry.content.$t) || (entry.summary && entry.summary.$t) || '';
            var imgUrl  = entry.media$thumbnail ? entry.media$thumbnail.url.replace('s72-c', 'w800-h600-c') : getFirstImage(raw);
            var snippet = entry.summary ? entry.summary.$t.replace(/<[^>]+>/g, '').substring(0, 145) + '…' : getSnippet(raw);
            var pubDate = entry.published && entry.published.$t ? new Date(entry.published.$t).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' }) : '';

            if (type === 'slider') {
              var imgHtml = imgUrl
                ? '<img src="' + imgUrl + '" alt="' + title + '" loading="lazy">'
                : '<div style="width:100%;height:500px;background:var(--secondary);display:flex;align-items:center;justify-content:center;"><p style="color:#fff;font-size:28px;font-family:var(--font-heading);margin:0;">' + siteTitleGlobal + '</p></div>';
              html += '<div class="slide">' + imgHtml + '<div class="slide-content"><h2>' + title + '</h2><p>' + snippet + '</p><a href="' + link + '" class="btn btn-primary">আরও জানুন</a></div></div>';

            } else if (type === 'ticker') {
              html += '<a href="' + link + '"><i aria-hidden="true" class="fas fa-bullhorn" style="margin-right:7px;color:var(--quaternary);"></i>' + title + '</a>';

            } else if (type === 'notice') {
              html += '<li><a href="' + link + '" class="notice-title"><i aria-hidden="true" class="fas fa-angle-right" style="color:var(--primary);margin-right:5px;"></i>' + title + '</a><span class="notice-date">' + pubDate + '</span></li>';

            } else if (type === 'welcome') {
              html += '<div class="welcome-box" style="display:block;"><h3 style="margin-top:0;color:var(--secondary);font-family:var(--font-heading);margin-bottom:14px;padding-bottom:12px;border-bottom:1px dashed var(--border-color);">' + title + '</h3><div style="font-size:15px;color:var(--text-body);line-height:1.85;">' + raw + '</div></div>';

            } else if (type === 'sidebar-message') {
              var label2 = targetId.indexOf('president') > -1 ? 'সভাপতির বক্তব্য' : 'সুপারইনটেনডেন্টের বক্তব্য';
              var avatarHtml = imgUrl
                ? '<img src="' + imgUrl + '" class="msg-avatar" alt="' + title + '">'
                : '<div class="msg-avatar" style="background:var(--secondary);display:flex;align-items:center;justify-content:center;color:#fff;font-size:38px;"><i aria-hidden="true" class="fas fa-user-tie"></i></div>';
              html += '<div class="sidebar-msg-card"><div class="sidebar-msg-header">' + label2 + '</div><div class="sidebar-msg-body">' + avatarHtml + '<h4 class="msg-name">' + title + '</h4><p class="msg-snippet">' + snippet + '</p><a href="' + link + '" class="btn btn-secondary btn-sm">বার্তাটি পড়ুন</a></div></div>';

            } else if (type === 'features') {
              var iconHtml = imgUrl
                ? '<img src="' + imgUrl + '" alt="' + title + '" loading="lazy" class="feature-icon">'
                : '<div class="feature-icon-fallback"><i aria-hidden="true" class="fas fa-check"></i></div>';
              html += '<div class="kid-card" style="text-align:center;">' + iconHtml + '<div class="kid-card-body" style="padding:14px;"><h3 class="kid-card-title"><a href="' + link + '">' + title + '</a></h3><p class="kid-card-excerpt">' + snippet + '</p></div></div>';

            } else if (type === 'grid') {
              var courseImg = imgUrl
                ? '<img src="' + imgUrl + '" alt="' + title + '" loading="lazy" class="course-img">'
                : '<div class="course-img-fallback"><p class="fallback-title">' + siteTitleGlobal + '</p></div>';
              html += '<div class="kid-card"><a class="course-img-wrap" href="' + link + '">' + courseImg + '</a><div class="kid-card-body"><h3 class="kid-card-title"><a href="' + link + '">' + title + '</a></h3><p class="kid-card-excerpt">' + snippet + '</p><a href="' + link + '" style="font-weight:700;font-size:13px;margin-top:auto;">বিস্তারিত পড়ুন &raquo;</a></div></div>';

            } else if (type === 'teachers') {
              var posM = raw.match(/(?:Position|Designation|পদবী)[:\s]+([^<\n|]+)/i);
              var pos  = posM ? posM[1].trim() : '';
              var avHtml = imgUrl
                ? '<img src="' + imgUrl + '" alt="' + title + '" loading="lazy" class="teacher-avatar">'
                : '<div class="teacher-avatar-fallback"><i aria-hidden="true" class="fas fa-user-tie"></i></div>';
              html += '<div class="kid-card" style="text-align:center;align-items:center;">' + avHtml + '<div class="kid-card-body" style="padding:0 20px 24px;"><h3 class="kid-card-title" style="color:var(--secondary);">' + title + '</h3>' + (pos ? '<p style="color:var(--primary);font-weight:600;margin:6px 0 0;">' + pos + '</p>' : '') + '</div></div>';

            } else if (type === 'gallery') {
              var gImg = imgUrl
                ? '<img src="' + imgUrl + '" alt="' + title + '" loading="lazy">'
                : '<div style="width:100%;height:100%;background:var(--secondary);display:flex;align-items:center;justify-content:center;min-height:170px;"><p style="color:#fff;font-size:16px;margin:0;">' + siteTitleGlobal + '</p></div>';
              html += '<a href="' + link + '" class="gallery-item" title="' + title + '">' + gImg + '<div aria-hidden="true" class="gallery-overlay"><i class="fas fa-search"></i></div></a>';
            }
          });

          container.innerHTML = html || '';

          // Init slider if needed
          if (type === 'slider' && entries.length > 1) {
            initSlider(entries.length);
          }
        })
        .catch(function(err) {
          console.warn('Section fetch error (' + label + '):', err);
          if (type === 'notice') {
            container.innerHTML = '<li style="justify-content:center;padding:20px;color:#ef4444;">নোটিশ লোড করা যাচ্ছে না।</li>';
          }
        });
    }

    /* ============================================================
       HERO SLIDER LOGIC
    ============================================================ */
    function initSlider(slideCount) {
      var container = document.getElementById('slider-container');
      var wrap      = document.getElementById('slider-wrap');
      if (!container || !wrap) return;

      // Inject controls
      container.insertAdjacentHTML('beforeend',
        '<button class="slider-btn prev-btn" id="slider-prev" aria-label="আগের স্লাইড" type="button">&#10094;</button>'
        + '<button class="slider-btn next-btn" id="slider-next" aria-label="পরের স্লাইড" type="button">&#10095;</button>'
        + '<div class="slider-dots" id="slider-dots" aria-label="স্লাইড নির্বাচক" role="tablist">'
        + Array.from({ length: slideCount }, function(_, i) {
            return '<button class="dot' + (i === 0 ? ' active' : '') + '" data-index="' + i + '" aria-label="স্লাইড ' + toBangla(i+1) + '" role="tab" aria-selected="' + (i===0) + '" type="button"></button>';
          }).join('')
        + '</div>'
      );

      var current = 0;
      var timer;
      var dots = container.querySelectorAll('.dot');

      function goTo(idx) {
        current = (idx + slideCount) % slideCount;
        wrap.style.transform = 'translateX(-' + (current * 100) + '%)';
        dots.forEach(function(d, i) {
          d.classList.toggle('active', i === current);
          d.setAttribute('aria-selected', i === current ? 'true' : 'false');
        });
      }

      function next() { goTo(current + 1); }
      function prev() { goTo(current - 1); }
      function resetTimer() { clearInterval(timer); timer = setInterval(next, 5000); }

      var prevBtn = document.getElementById('slider-prev');
      var nextBtn = document.getElementById('slider-next');
      if (prevBtn) prevBtn.addEventListener('click', function(){ prev(); resetTimer(); });
      if (nextBtn) nextBtn.addEventListener('click', function(){ next(); resetTimer(); });

      dots.forEach(function(dot) {
        dot.addEventListener('click', function(){ goTo(parseInt(this.getAttribute('data-index'), 10)); resetTimer(); });
      });

      // Touch swipe support
      var touchStartX = 0;
      container.addEventListener('touchstart', function(e){ touchStartX = e.changedTouches[0].screenX; }, { passive: true });
      container.addEventListener('touchend', function(e) {
        var dx = e.changedTouches[0].screenX - touchStartX;
        if (Math.abs(dx) > 50) { dx < 0 ? next() : prev(); resetTimer(); }
      }, { passive: true });

      resetTimer();
    }

    /* ============================================================
       RELATED POSTS
    ============================================================ */
    function initRelatedPosts() {
      var trigger = document.getElementById('related-posts-trigger');
      if (!trigger) return;

      var relatedLabel = trigger.getAttribute('data-label');
      var grid         = document.getElementById('related-grid');

      fetchJSON('/feeds/posts/default/-/' + encodeURIComponent(relatedLabel) + '?alt=json&max-results=4')
        .then(function(data) {
          if (!data.feed || !data.feed.entry || data.feed.entry.length < 2) {
            trigger.style.display = 'none';
            return;
          }
          var html = '';
          data.feed.entry.forEach(function(entry) {
            var title   = entry.title.$t;
            var linkObj = entry.link.find(function(l){ return l.rel === 'alternate'; });
            var link    = linkObj ? linkObj.href : '#';
            var raw     = (entry.content && entry.content.$t) || '';
            var imgUrl  = entry.media$thumbnail ? entry.media$thumbnail.url.replace('s72-c','w800-h600-c') : getFirstImage(raw);
            var snippet = getSnippet(raw);
            var imgHtml = imgUrl
              ? '<img src="' + imgUrl + '" alt="' + title + '" loading="lazy" class="course-img">'
              : '<div class="course-img-fallback"><p class="fallback-title">' + siteTitleGlobal + '</p></div>';
            html += '<div class="kid-card"><a class="course-img-wrap" href="' + link + '">' + imgHtml + '</a><div class="kid-card-body"><h3 class="kid-card-title"><a href="' + link + '">' + title + '</a></h3><p class="kid-card-excerpt">' + snippet + '</p><a href="' + link + '" style="font-weight:700;font-size:13px;margin-top:auto;">বিস্তারিত পড়ুন &raquo;</a></div></div>';
          });
          if (grid) grid.innerHTML = html;
        })
        .catch(function() { if (trigger) trigger.style.display = 'none'; });
    }

    /* ============================================================
       INIT ON DOM READY
    ============================================================ */
    document.addEventListener('DOMContentLoaded', function() {
      initContactIcons();
      initSocialIcons();
      initMobileNav();
      initLiveSearch();
      initScrollEvents();
      initReadingTime();
      initTables();
      initGalleryLayout();
      initRelatedPosts();

      // Fetch dynamic sections
      fetchSection('সর্বশেষ খবর',   5, 'ticker',  'ticker-marquee');
      fetchSection('স্লাইডার',       3, 'slider',  'slider-wrap');
      fetchSection('নোটিশ',          5, 'notice',  'notice-list-container');
      fetchSection('এক নজরে',        1, 'welcome', 'welcome-speech-wrap');
      fetchSection('সভাপতির বক্তব্য',           1, 'sidebar-message', 'sidebar-president-wrap');
      fetchSection('সুপারইনটেনডেন্টের বক্তব্য', 1, 'sidebar-message', 'sidebar-principal-wrap');
      fetchSection('ফিচারড বৈশিষ্ট সমূহ', 4, 'features', 'features-wrap');
      fetchSection('ফিচারড কোর্সসমূহ',    6, 'grid',     'courses-wrap');
      fetchSection('ফিচারড শিক্ষকবৃন্দ',  4, 'teachers', 'teachers-wrap');
      fetchSection('ফিচারড ফটো গ্যালারি', 6, 'gallery',  'gallery-wrap');

      // Dashboard label cards
      var labels = (typeof userConfiguredLabels !== 'undefined' && userConfiguredLabels.length)
        ? userConfiguredLabels
        : ['সম্পর্কে', 'একাডেমিক তথ্য', 'শিক্ষার্থী কর্নার', 'প্রশাসন'];
      labels.forEach(function(lbl) { fetchLabelCard(lbl, 'label-cards-wrap'); });
    });

  })();
