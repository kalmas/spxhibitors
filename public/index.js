/* lazy-image.js */
/* global angular */
angular.module('afkl.lazyImage', []);
/* global angular */
angular.module('afkl.lazyImage')
    .service('afklSrcSetService', ['$window', function($window) {
        'use strict';

        /**
         * For other applications wanting the srccset/best image approach it is possible to use this module only
         * Loosely based on https://raw.github.com/borismus/srcset-polyfill/master/js/srcset-info.js
         */
        var INT_REGEXP = /^[0-9]+$/;

        // SRCSET IMG OBJECT
        function ImageInfo(options) {
            this.src = options.src;
            this.w = options.w || Infinity;
            this.h = options.h || Infinity;
            this.x = options.x || 1;
        }

        /**
         * Parse srcset rules
         * @param  {string} descString Containing all srcset rules
         * @return {object}            Srcset rules
         */
        var _parseDescriptors = function (descString) {

            var descriptors = descString.split(/\s/);
            var out = {};

            for (var i = 0, l = descriptors.length; i < l; i++) {

                var desc = descriptors[i];

                if (desc.length > 0) {

                    var lastChar = desc.slice(-1);
                    var value = desc.substring(0, desc.length - 1);
                    var intVal = parseInt(value, 10);
                    var floatVal = parseFloat(value);

                    if (value.match(INT_REGEXP) && lastChar === 'w') {
                        out[lastChar] = intVal;
                    } else if (value.match(INT_REGEXP) && lastChar === 'h') {
                        out[lastChar] = intVal;
                    } else if (!isNaN(floatVal) && lastChar === 'x') {
                        out[lastChar] = floatVal;
                    } 

                }
            }

            return out;

        };

        /**
         * Returns best candidate under given circumstances
         * @param  {object} images     Candidate image
         * @param  {function} criteriaFn Rule
         * @return {object}            Returns best candidate under given criteria
         */
        var _getBestCandidateIf = function (images, criteriaFn) {

            var bestCandidate = images[0];

            for (var i = 0, l = images.length; i < l; i++) {
                var candidate = images[i];
                if (criteriaFn(candidate, bestCandidate)) {
                    bestCandidate = candidate;
                }
            }

            return bestCandidate;

        };

        /**
         * Remove candidate under given circumstances
         * @param  {object} images     Candidate image
         * @param  {function} criteriaFn Rule
         * @return {object}            Removes images from global image collection (candidates)
         */
        var _removeCandidatesIf = function (images, criteriaFn) {

            for (var i = images.length - 1; i >= 0; i--) {
                var candidate = images[i];
                if (criteriaFn(candidate)) {
                    images.splice(i, 1); // remove it
                }
            }

            return images;

        };
      
        /**
        * Direct implementation of "processing the image candidates":
        * http://www.whatwg.org/specs/web-apps/current-work/multipage/embedded-content-1.html#processing-the-image-candidates
        *
        * @param  {array} imageCandidates (required)
        * @param  {object} view (optional)
        * @returns {ImageInfo} The best image of the possible candidates.
        */
        var getBestImage = function (imageCandidates, view) {

            if (!imageCandidates) { return; }
            if (!view) {
                view = {
                    'w' : $window.innerWidth || document.documentElement.clientWidth,
                    'h' : $window.innerHeight || document.documentElement.clientHeight,
                    'x' : $window.devicePixelRatio || 1
                };
            }

            var images = imageCandidates.slice(0);

            /* LARGEST */
            // Width
            var largestWidth = _getBestCandidateIf(images, function (a, b) { return a.w > b.w; });
            // Less than client width.
            _removeCandidatesIf(images, (function () { return function (a) { return a.w < view.w; }; })(this));
            // If none are left, keep the one with largest width.
            if (images.length === 0) { images = [largestWidth]; }


            // Height
            var largestHeight = _getBestCandidateIf(images, function (a, b) { return a.h > b.h; });
            // Less than client height.
            _removeCandidatesIf(images, (function () { return function (a) { return a.h < view.h; }; })(this));
            // If none are left, keep one with largest height.
            if (images.length === 0) { images = [largestHeight]; }

            // Pixel density.
            var largestPxDensity = _getBestCandidateIf(images, function (a, b) { return a.x > b.x; });
            // Remove all candidates with pxdensity less than client pxdensity.
            _removeCandidatesIf(images, (function () { return function (a) { return a.x < view.x; }; })(this));
            // If none are left, keep one with largest pixel density.
            if (images.length === 0) { images = [largestPxDensity]; }


            /* SMALLEST */
            // Width
            var smallestWidth = _getBestCandidateIf(images, function (a, b) { return a.w < b.w; });
            // Remove all candidates with width greater than it.
            _removeCandidatesIf(images, function (a) { return a.w > smallestWidth.w; });

            // Height
            var smallestHeight = _getBestCandidateIf(images, function (a, b) { return a.h < b.h; });
            // Remove all candidates with height greater than it.
            _removeCandidatesIf(images, function (a) { return a.h > smallestHeight.h; });

            // Pixel density
            var smallestPxDensity = _getBestCandidateIf(images, function (a, b) { return a.x < b.x; });
            // Remove all candidates with pixel density less than smallest px density.
            _removeCandidatesIf(images, function (a) { return a.x > smallestPxDensity.x; });

            return images[0];

        };



        // options {src: null/string, srcset: string}
        // options.src    normal url or null
        // options.srcset 997-s.jpg 480w, 997-m.jpg 768w, 997-xl.jpg 1x
        var getSrcset = function (options) {

            var imageCandidates = [];

            var srcValue = options.src;
            var srcsetValue = options.srcset;

            if (!srcsetValue) { return; }

            /* PUSH CANDIDATE [{src: _, x: _, w: _, h:_}, ...] */
            var _addCandidate = function (img) {

                for (var j = 0, ln = imageCandidates.length; j < ln; j++) {
                    var existingCandidate = imageCandidates[j];

                    // DUPLICATE
                    if (existingCandidate.x === img.x &&
                        existingCandidate.w === img.w &&
                        existingCandidate.h === img.h) { return; }
                }

                imageCandidates.push(img);

            };


            var _parse = function () {

                var input = srcsetValue,
                position = 0,
                rawCandidates = [],
                url,
                descriptors;

                while (input !== '') {

                    while (input.charAt(0) === ' ') {
                        input = input.slice(1);
                    }

                    position = input.indexOf(' ');

                    if (position !== -1) {

                        url = input.slice(0, position);

                        // if (url === '') { break; }

                        input = input.slice(position + 1);

                        position = input.indexOf(',');

                        if (position === -1) {
                            descriptors = input;
                            input = '';
                        } else {
                            descriptors =  input.slice(0, position);
                            input = input.slice(position + 1);
                        }

                        rawCandidates.push({
                            url: url,
                            descriptors: descriptors
                        });

                    } else {

                        rawCandidates.push({
                            url: input,
                            descriptors: ''
                        });
                        input = '';
                    }

                }

                // FROM RAW CANDIDATES PUSH IMAGES TO COMPLETE SET
                for (var i = 0, l = rawCandidates.length; i < l; i++) {

                    var candidate = rawCandidates[i],
                    desc = _parseDescriptors(candidate.descriptors);

                    _addCandidate(new ImageInfo({
                        src: candidate.url,
                        x: desc.x,
                        w: desc.w,
                        h: desc.h
                    }));

                }

                if (srcValue) {
                    _addCandidate(new ImageInfo({src: srcValue}));
                }

            };

            _parse();


            // Return best available image for current view based on our list of candidates
            var bestImage = getBestImage(imageCandidates);

            /**
             * Object returning best match at moment, and total collection of candidates (so 'image' API can be used by consumer)
             * @type {Object}
             */
            var object = {
                'best': bestImage,              // IMAGE INFORMATION WHICH FITS BEST WHEN API IS REQUESTED
                'candidates': imageCandidates   // ALL IMAGE CANDIDATES BY GIVEN SRCSET ATTRIBUTES
            };

            // empty collection
            imageCandidates = null;

            // pass best match and candidates
            return object;

        };


        /**
         * PUBLIC API
         */
        return {
            get: getSrcset,        // RETURNS BEST IMAGE AND IMAGE CANDIDATES
            image: getBestImage    // RETURNS BEST IMAGE WITH GIVEN CANDIDATES
        };


    }]);

/* global angular */
angular.module('afkl.lazyImage')
    .directive('afklImageContainer', function () {
        'use strict';

        return {
            restrict: 'A',
            // We have to use controller instead of link here so that it will always run earlier than nested afklLazyImage directives
            controller: ['$scope', '$element', function ($scope, $element) {
                $element.data('afklImageContainer', $element);
            }]
        };
    })
    .directive('afklLazyImage', ['$window', '$timeout', 'afklSrcSetService', '$parse', function ($window, $timeout, srcSetService, $parse) {
        'use strict';

        // Use srcSetService to find out our best available image
        var bestImage = function (images) {
            var image = srcSetService.get({srcset: images});
            var sourceUrl;
            if (image) {
                sourceUrl = image.best.src;
            }
            return sourceUrl;
        };

        return {
            restrict: 'A',
            link: function (scope, element, attrs) {

                // CONFIGURATION VARS
                var $container = element.inheritedData('afklImageContainer');
                if (!$container) {
                    $container = angular.element(attrs.afklLazyImageContainer || $window);
                }

                var loaded = false;
                var timeout;

                var images = attrs.afklLazyImage; // srcset attributes
                var options = attrs.afklLazyImageOptions ? $parse(attrs.afklLazyImageOptions)(scope) : {}; // options (background, offset)

                var img; // Angular element to image which will be placed
                var currentImage = null; // current image url
                var offset = options.offset ? options.offset : 50; // default offset
                var alt = options.alt ? 'alt="' + options.alt + '"' : 'alt=""';

                var LOADING = 'afkl-lazy-image-loading';

                var IMAGECLASSNAME = 'afkl-lazy-image';
                
                if (options.className) {
                    IMAGECLASSNAME = IMAGECLASSNAME + ' ' + options.className;
                }

                attrs.afklLazyImageLoaded = false;

                var _containerScrollTop = function () {
                    // See if we can use jQuery, with extra check
                    // TODO: check if number is returned
                    if ($container.scrollTop) {
                        var scrollTopPosition = $container.scrollTop();
                        if (scrollTopPosition) {
                            return scrollTopPosition;
                        }
                    }

                    var c = $container[0];
                    if (c.pageYOffset !== undefined) {
                        return c.pageYOffset;
                    }
                    else if (c.scrollTop !== undefined) {
                        return c.scrollTop;
                    }

                    return document.documentElement.scrollTop || 0;
                };

                var _containerInnerHeight = function () {
                    if ($container.innerHeight) {
                        return $container.innerHeight();
                    }

                    var c = $container[0];
                    if (c.innerHeight !== undefined) {
                        return c.innerHeight;
                    } else if (c.clientHeight !== undefined) {
                        return c.clientHeight;
                    }

                    return document.documentElement.clientHeight || 0;
                };

                // Begin with offset and update on resize
                var _elementOffset = function () {
                    if (element.offset) {
                        return element.offset().top;
                    }
                    var box = element[0].getBoundingClientRect();
                    return box.top + _containerScrollTop() - document.documentElement.clientTop;
                };

                var _elementOffsetContainer = function () {
                    if (element.offset) {
                        return element.offset().top - $container.offset().top;
                    }
                    return element[0].getBoundingClientRect().top - $container[0].getBoundingClientRect().top;
                };

                // Update url of our image
                var _setImage = function () {
                    if (options.background) {
                        element[0].style.backgroundImage = 'url("' + currentImage +'")';
                    } else {
                        img[0].src = currentImage;
                    }
                };

                // Append image to DOM
                var _placeImage = function () {

                    loaded = true;
                    // What is my best image available
                    var hasImage = bestImage(images);

                    if (hasImage) {
                        // we have to make an image if background is false (default)
                        if (!options.background) {
                            
                            if (!img) {
                                // element.addClass(LOADING);
                                img = angular.element('<img ' + alt + ' class="' + IMAGECLASSNAME + '" src=""/>');
                                // img.one('load', _loaded);
                                // remove loading class when image is acually loaded
                                element.append(img);
                            }

                        }

                        // set correct src/url
                        _checkIfNewImage();
                    }

                    // Element is added to dom, no need to listen to scroll anymore
                    $container.off('scroll', _onViewChange);

                };

                // Check on resize if actually a new image is best fit, if so then apply it
                var _checkIfNewImage = function () {
                    if (loaded) {
                        var newImage = bestImage(images);
                        if (newImage !== currentImage) {
                            // update current url
                            currentImage = newImage;

                            if (!options.background) {
                                element.addClass(LOADING);
                                img.one('load', _loaded);
                                img.one('error', _error);
                            }
                            
                            // update image url
                            _setImage();
                        }
                    }
                };

                // First update our begin offset
                _checkIfNewImage();

                var _loaded = function () {

                    attrs.$set('afklLazyImageLoaded', 'done');

                    element.removeClass(LOADING);

                };

                var _error = function () {

                    attrs.$set('afklLazyImageLoaded', 'fail');

                };

                // Check if the container is in view for the first time. Utilized by the scroll and resize events.
                var _onViewChange = function () {
                    // Config vars
                    var remaining, shouldLoad, windowBottom;

                    var height = _containerInnerHeight();
                    var scroll = _containerScrollTop();

                    var elOffset = $container[0] === $window ? _elementOffset() : _elementOffsetContainer();
                    windowBottom = $container[0] === $window ? height + scroll : height;

                    remaining = elOffset - windowBottom;

                    // Is our top of our image container in bottom of our viewport?
                    //console.log($container[0].className, _elementOffset(), _elementPosition(), height, scroll, remaining, elOffset);
                    shouldLoad = remaining <= offset;


                    // Append image first time when it comes into our view, after that only resizing can have influence
                    if (shouldLoad && !loaded) {

                        _placeImage();

                    }
                };

                // EVENT: RESIZE THROTTLED
                var _onResize = function () {
                    $timeout.cancel(timeout);
                    timeout = $timeout(function() {
                        _checkIfNewImage();
                        _onViewChange();
                    }, 300);
                };


                // Remove events for total destroy
                var _eventsOff = function() {

                    $timeout.cancel(timeout);

                    $container.off('scroll', _onViewChange);
                    angular.element($window).off('resize', _onResize);
                    if ($container[0] !== $window) {
                        $container.off('resize', _onResize);
                    }

                    // remove image being placed
                    if (img) {
                        img.remove();
                    }

                    img = timeout = currentImage = undefined;
                };



                // Set events for scrolling and resizing
                $container.on('scroll', _onViewChange);
                angular.element($window).on('resize', _onResize);

                if ($container[0] !== $window) {
                    $container.on('resize', _onResize);
                }

                // events for image change
                attrs.$observe('afklLazyImage', function () {
                    images = attrs.afklLazyImage;
                    if (loaded) {
                        _placeImage();
                    }
                });

                // Image should be directly placed
                if (options.nolazy) {
                    _placeImage();
                }

                // Remove all events when destroy takes place
                scope.$on('$destroy', function () {
                    return _eventsOff();
                });

                return _onViewChange();

            }
        };

}]);










/* infinite-scroll.js */
/* ng-infinite-scroll - v1.2.0 - 2015-02-14 */
var mod;

mod = angular.module('infinite-scroll', []);

mod.value('THROTTLE_MILLISECONDS', null);

mod.directive('infiniteScroll', [
  '$rootScope', '$window', '$interval', 'THROTTLE_MILLISECONDS', function($rootScope, $window, $interval, THROTTLE_MILLISECONDS) {
    return {
      scope: {
        infiniteScroll: '&',
        infiniteScrollContainer: '=',
        infiniteScrollDistance: '=',
        infiniteScrollDisabled: '=',
        infiniteScrollUseDocumentBottom: '=',
        infiniteScrollListenForEvent: '@'
      },
      link: function(scope, elem, attrs) {
        var changeContainer, checkWhenEnabled, container, handleInfiniteScrollContainer, handleInfiniteScrollDisabled, handleInfiniteScrollDistance, handleInfiniteScrollUseDocumentBottom, handler, height, immediateCheck, offsetTop, pageYOffset, scrollDistance, scrollEnabled, throttle, unregisterEventListener, useDocumentBottom, windowElement;
        windowElement = angular.element($window);
        scrollDistance = null;
        scrollEnabled = null;
        checkWhenEnabled = null;
        container = null;
        immediateCheck = true;
        useDocumentBottom = false;
        unregisterEventListener = null;
        height = function(elem) {
          elem = elem[0] || elem;
          if (isNaN(elem.offsetHeight)) {
            return elem.document.documentElement.clientHeight;
          } else {
            return elem.offsetHeight;
          }
        };
        offsetTop = function(elem) {
          if (!elem[0].getBoundingClientRect || elem.css('none')) {
            return;
          }
          return elem[0].getBoundingClientRect().top + pageYOffset(elem);
        };
        pageYOffset = function(elem) {
          elem = elem[0] || elem;
          if (isNaN(window.pageYOffset)) {
            return elem.document.documentElement.scrollTop;
          } else {
            return elem.ownerDocument.defaultView.pageYOffset;
          }
        };
        handler = function() {
          var containerBottom, containerTopOffset, elementBottom, remaining, shouldScroll;
          if (container === windowElement) {
            containerBottom = height(container) + pageYOffset(container[0].document.documentElement);
            elementBottom = offsetTop(elem) + height(elem);
          } else {
            containerBottom = height(container);
            containerTopOffset = 0;
            if (offsetTop(container) !== void 0) {
              containerTopOffset = offsetTop(container);
            }
            elementBottom = offsetTop(elem) - containerTopOffset + height(elem);
          }
          if (useDocumentBottom) {
            elementBottom = height((elem[0].ownerDocument || elem[0].document).documentElement);
          }
          remaining = elementBottom - containerBottom;
          shouldScroll = remaining <= height(container) * scrollDistance + 1;
          if (shouldScroll) {
            checkWhenEnabled = true;
            if (scrollEnabled) {
              if (scope.$$phase || $rootScope.$$phase) {
                return scope.infiniteScroll();
              } else {
                return scope.$apply(scope.infiniteScroll);
              }
            }
          } else {
            return checkWhenEnabled = false;
          }
        };
        throttle = function(func, wait) {
          var later, previous, timeout;
          timeout = null;
          previous = 0;
          later = function() {
            var context;
            previous = new Date().getTime();
            $interval.cancel(timeout);
            timeout = null;
            func.call();
            return context = null;
          };
          return function() {
            var now, remaining;
            now = new Date().getTime();
            remaining = wait - (now - previous);
            if (remaining <= 0) {
              clearTimeout(timeout);
              $interval.cancel(timeout);
              timeout = null;
              previous = now;
              return func.call();
            } else {
              if (!timeout) {
                return timeout = $interval(later, remaining, 1);
              }
            }
          };
        };
        if (THROTTLE_MILLISECONDS != null) {
          handler = throttle(handler, THROTTLE_MILLISECONDS);
        }
        scope.$on('$destroy', function() {
          container.unbind('scroll', handler);
          if (unregisterEventListener != null) {
            unregisterEventListener();
            return unregisterEventListener = null;
          }
        });
        handleInfiniteScrollDistance = function(v) {
          return scrollDistance = parseFloat(v) || 0;
        };
        scope.$watch('infiniteScrollDistance', handleInfiniteScrollDistance);
        handleInfiniteScrollDistance(scope.infiniteScrollDistance);
        handleInfiniteScrollDisabled = function(v) {
          scrollEnabled = !v;
          if (scrollEnabled && checkWhenEnabled) {
            checkWhenEnabled = false;
            return handler();
          }
        };
        scope.$watch('infiniteScrollDisabled', handleInfiniteScrollDisabled);
        handleInfiniteScrollDisabled(scope.infiniteScrollDisabled);
        handleInfiniteScrollUseDocumentBottom = function(v) {
          return useDocumentBottom = v;
        };
        scope.$watch('infiniteScrollUseDocumentBottom', handleInfiniteScrollUseDocumentBottom);
        handleInfiniteScrollUseDocumentBottom(scope.infiniteScrollUseDocumentBottom);
        changeContainer = function(newContainer) {
          if (container != null) {
            container.unbind('scroll', handler);
          }
          container = newContainer;
          if (newContainer != null) {
            return container.bind('scroll', handler);
          }
        };
        changeContainer(windowElement);
        if (scope.infiniteScrollListenForEvent) {
          unregisterEventListener = $rootScope.$on(scope.infiniteScrollListenForEvent, handler);
        }
        handleInfiniteScrollContainer = function(newContainer) {
          if ((newContainer == null) || newContainer.length === 0) {
            return;
          }
          if (newContainer instanceof HTMLElement) {
            newContainer = angular.element(newContainer);
          } else if (typeof newContainer.append === 'function') {
            newContainer = angular.element(newContainer[newContainer.length - 1]);
          } else if (typeof newContainer === 'string') {
            newContainer = angular.element(document.querySelector(newContainer));
          }
          if (newContainer != null) {
            return changeContainer(newContainer);
          } else {
            throw new Exception("invalid infinite-scroll-container attribute.");
          }
        };
        scope.$watch('infiniteScrollContainer', handleInfiniteScrollContainer);
        handleInfiniteScrollContainer(scope.infiniteScrollContainer || []);
        if (attrs.infiniteScrollParent != null) {
          changeContainer(angular.element(elem.parent()));
        }
        if (attrs.infiniteScrollImmediateCheck != null) {
          immediateCheck = scope.$eval(attrs.infiniteScrollImmediateCheck);
        }
        return $interval((function() {
          if (immediateCheck) {
            return handler();
          }
        }), 0, 1);
      }
    };
  }
]);










/* sticky.js */
(function () {
	'use strict';

	var module = angular.module('sticky', []);

	// Directive: sticky
	//
	module.directive('sticky', function() {
		return {
			restrict: 'A', // this directive can only be used as an attribute.
			link: linkFn
		};

		function linkFn($scope, $elem, $attrs) {
			var mediaQuery, stickyClass, bodyClass, elem, $window, $body,
				doc, initialCSS, initialStyle, isPositionFixed, isSticking,
				stickyLine, offset, anchor, prevOffset, matchMedia;

			isPositionFixed = false;
			isSticking      = false;

			matchMedia      = window.matchMedia;

			// elements
			$window = angular.element(window);
			$body   = angular.element(document.body);
			elem    = $elem[0];
			doc     = document.documentElement;

			// attributes
			mediaQuery  = $attrs.mediaQuery  || false;
			stickyClass = $attrs.stickyClass || '';
			bodyClass   = $attrs.bodyClass   || '';

			initialStyle = $elem.attr('style');

			offset = typeof $attrs.offset === 'string' ? 
				parseInt($attrs.offset.replace(/px;?/, '')) : 
				0;

			anchor = typeof $attrs.anchor === 'string' ? 
				$attrs.anchor.toLowerCase().trim() 
				: 'top';

			// initial style
			initialCSS = {
				top:       $elem.css('top'),
				width:     $elem.css('width'),
				position:  $elem.css('position'),
				marginTop: $elem.css('margin-top'),
				cssLeft:   $elem.css('left')
			};

			switch (anchor) {
				case 'top':
				case 'bottom':
					break;
				default:
					console.log('Unknown anchor '+anchor+', defaulting to top');
					anchor = 'top';
					break;
			}


			// Listeners
			//
			$window.on('scroll',  checkIfShouldStick);
			$window.on('resize',  $scope.$apply.bind($scope, onResize));
			$scope.$on('$destroy', onDestroy);

			function onResize() {
				initialCSS.offsetWidth = elem.offsetWidth;
				checkIfShouldStick();
				
				if(isSticking){
					var parent = window.getComputedStyle(elem.parentElement, null),
						initialOffsetWidth = elem.parentElement.offsetWidth - 
							parent.getPropertyValue('padding-right').replace('px', '') - 
							parent.getPropertyValue('padding-left').replace('px', '');

					$elem.css('width', initialOffsetWidth+'px');
				}
			}

			function onDestroy() {
				$window.off('scroll', checkIfShouldStick);
				$window.off('resize', onResize);
				
				if ( bodyClass ) {
					$body.removeClass(bodyClass);
				}
			}


			// Watcher
			//
			prevOffset = _getTopOffset(elem);

			$scope.$watch( function() { // triggered on load and on digest cycle
				if ( isSticking ) return prevOffset;

				prevOffset = 
					(anchor === 'top') ? 
						_getTopOffset(elem) :
						_getBottomOffset(elem);

				return prevOffset;

			}, function(newVal, oldVal) {
				if ( newVal !== oldVal || typeof stickyLine === 'undefined' ) {
					stickyLine = newVal - offset;
					checkIfShouldStick();
				}
			});


			// Methods
			//
			function checkIfShouldStick() {
				var scrollTop, shouldStick, scrollBottom, scrolledDistance;

				if ( mediaQuery && !matchMedia('('+mediaQuery+')').matches) 
					return;

				if ( anchor === 'top' ) {
					scrolledDistance = window.pageYOffset || doc.scrollTop;
					scrollTop        = scrolledDistance  - (doc.clientTop || 0);
					shouldStick      = scrollTop >=  stickyLine;
				} else {
					scrollBottom     = window.pageYOffset + window.innerHeight;
					shouldStick      = scrollBottom <= stickyLine;
				}

				// Switch the sticky mode if the element crosses the sticky line
				if ( shouldStick && !isSticking )
					stickElement();
						
				else if ( !shouldStick && isSticking )
					unstickElement();
			}

			function stickElement() {
				var rect, absoluteLeft;

				rect = $elem[0].getBoundingClientRect();
				absoluteLeft = rect.left;

				initialCSS.offsetWidth = elem.offsetWidth;

				isSticking = true;

				if ( bodyClass ) {
					$body.addClass(bodyClass);
				}

				if ( stickyClass ) {
					$elem.addClass(stickyClass);
				}

				$elem
					.css('width',      elem.offsetWidth+'px')
					.css('position',   'fixed')
					.css(anchor,       offset+'px')
					.css('left',       absoluteLeft)
					.css('margin-top', 0);

				if ( anchor === 'bottom' ) {
					$elem.css('margin-bottom', 0);
				}
			}

			function unstickElement() {
				$elem.attr('style', $elem.initialStyle);
				isSticking = false;

				if ( bodyClass ) {
					$body.removeClass(bodyClass);
				}

				if ( stickyClass ) {
					$elem.removeClass(stickyClass);
				}

				$elem
					.css('width',      '')
					.css('top',        initialCSS.top)
					.css('position',   initialCSS.position)
					.css('left',       initialCSS.cssLeft)
					.css('margin-top', initialCSS.marginTop);
			}

			function _getTopOffset (element) {
				var pixels = 0;

				if (element.offsetParent) {
					do {
						pixels += element.offsetTop;
						element = element.offsetParent;
					} while (element);
				}

				return pixels;
			}

			function _getBottomOffset (element) {
				return element.offsetTop + element.clientHeight;
			}
		}

	});

	// Shiv: matchMedia
	//
	window.matchMedia = window.matchMedia || (function() {
		var warning = 'angular-sticky: This browser does not support '+
			'matchMedia, therefore the minWidth option will not work on '+
			'this browser. Polyfill matchMedia to fix this issue.';

		if ( window.console && console.warn ) {
			console.warn(warning);
		}

		return function() {
			return {
				matches: true
			};
		};
	}());

}());










/* app.js */
'use strict';

window.angular.module('myApp', ['afkl.lazyImage', 'infinite-scroll', 'sticky'])

.controller('ApplicationController', ['$scope', '$http', '$window',
function($scope, $http, $window) {
    $scope.displayed = [];
    $scope.count = 0;
    $scope.scrollDisabled = true;
    $scope.predicate = 'l';
    $scope.reverse = false;
    
    $http.get('/small.json').then(function(response) {
        $scope.displayed = response.data;
        
        $scope.addResults();
        $scope.scrollDisabled = false;
    });
    
    $scope.addResults = function() {
        if ($scope.count < $scope.displayed.length) {
            $scope.count += 20;
        } else {
            $scope.scrollDisabled = true;
        }
    };
      
    $scope.order = function(predicate) {
        $scope.reverse = ($scope.predicate === predicate) ? !$scope.reverse : false;
        $scope.predicate = predicate;
    };
}])

.filter('customOrderBy', ['$window', function($window) {
    return function(items, field, reverse) {
        
        var sorted = [];
        $window.angular.forEach(items, function(item) {
            sorted.push(item);
        });
    
        sorted.sort(function (a, b) {
            if (!a[field]) { return 1; }
          
            if (!b[field]) { return -1; }
          
            return (a[field] > b[field] ? 1 : -1);
        });
    
        if(reverse) { sorted.reverse(); }
    
      return sorted;
  };
}])

.filter('customSearch', ['$window', function($window) {
    return function(items, searchTerm) {
      if (!searchTerm) { return items; }
    
      var filtered = [];
      var needle = searchTerm.toLowerCase();
      $window.angular.forEach(items, function(item) {
          var haystack = (item.f + ' ' + item.l).toLowerCase();
          if (haystack.indexOf(needle) > -1) {
              filtered.push(item);
          }
      });
    
    return filtered;
  };
}])

.filter('scrollHack', ['$window', function($window) {
    return function(items) {
      // Fake scroll.
      $window.angular.element($window).triggerHandler('scroll');
    
      return items;
  };
}]);
