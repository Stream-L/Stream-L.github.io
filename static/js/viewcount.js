;(function (){
  'use strict';

  function getNamespace(el){
    return el.dataset.viewNamespace || window.location.hostname.replace(/\./g,'-');
  }

  function getKey(el){
    return el.dataset.viewKey || (window.location.pathname.replace(/^\//,'').replace(/\/$/, '').replace(/\//g,'-') || 'home');
  }

  function setText(el, txt){
    var span = el.querySelector('.article-views-count');
    if(span) span.innerText = txt;
  }

  function fetchCount(ns, key, increment){
    var url = 'https://api.countapi.xyz/' + (increment ? 'hit' : 'get') + '/' + encodeURIComponent(ns) + '/' + encodeURIComponent(key);
    return fetch(url).then(function(res){ return res.json(); });
  }

  function update(el){
    var ns = getNamespace(el);
    var key = getKey(el);
    var storageKey = 'vc-' + ns + '-' + key;

    // 如果本地没有标记过，则尝试增加计数；否则只读取
    if(!localStorage.getItem(storageKey)){
      fetchCount(ns, key, true).then(function(data){
        if(data && data.value !== undefined){
          setText(el, data.value);
          try{ localStorage.setItem(storageKey, '1'); }catch(e){}
        }
      }).catch(function(){
        // 增加失败则尝试读取
        fetchCount(ns, key, false).then(function(data){ if(data && data.value !== undefined) setText(el, data.value); }).catch(function(){ setText(el, '—'); });
      });
    } else {
      fetchCount(ns, key, false).then(function(data){ if(data && data.value !== undefined) setText(el, data.value); }).catch(function(){ setText(el, '—'); });
    }
  }

  document.addEventListener('DOMContentLoaded', function(){
    try{
      var els = document.querySelectorAll('.article-views[data-view-key]');
      els.forEach(function(el){ update(el); });
    }catch(e){ /* ignore */ }
  });
})();
