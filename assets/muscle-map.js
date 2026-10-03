/* Original vector artwork shared by the explorer and exercise sheets. */
const MuscleAtlas = (() => {
  let sequence = 0;
  const names = {chest:'Chest',delts:'Shoulders',biceps:'Biceps',forearms:'Forearms',abs:'Abs / Core',obliques:'Obliques',quads:'Quads',calves:'Calves',traps:'Traps',reardelts:'Rear delts',triceps:'Triceps',lats:'Back / Lats',lowerback:'Lower back',glutes:'Glutes',hams:'Hamstrings'};
  const regions = {
    front: [
      ['delts','M117 88 C103 85 94 96 94 112 L104 127 C109 113 117 108 124 103 Z','M114 93 Q100 102 101 116 M119 97 Q108 105 106 117'],
      ['chest','M126 94 Q142 91 157 98 L157 128 Q140 140 119 125 L112 111 Z','M124 100 L152 104 M120 106 L152 112 M119 112 L151 120 M123 120 L146 128'],
      ['biceps','M102 125 Q110 130 108 145 L98 166 Q91 170 89 159 L91 139 Z','M101 131 Q102 148 94 160 M97 135 L93 151'],
      ['forearms','M88 168 Q96 174 96 181 L81 219 L71 219 Q71 199 78 183 Z','M87 179 L76 211 M91 184 L81 207 M80 187 L74 203'],
      ['obliques','M117 132 L130 142 L132 199 L145 220 Q126 215 121 195 L116 160 Z','M118 142 L130 151 M118 154 L130 164 M119 168 L131 178 M121 182 L133 192 M125 197 L139 211'],
      ['abs','M136 138 Q144 140 157 136 L157 153 L135 153 Z M135 157 L157 157 L157 174 L135 174 Z M135 178 L157 178 L157 195 L137 195 Z M138 199 L157 199 L157 222 Q145 217 138 208 Z','M140 143 L153 142 M140 162 L153 162 M140 183 L153 183 M144 204 L153 206'],
      ['quads','M123 224 Q135 233 143 239 L147 282 L142 326 Q136 333 129 321 L118 283 Q115 255 123 224 Z M145 241 L156 247 L154 298 Q151 321 145 327 L146 294 Z','M125 238 Q121 272 135 311 M129 243 Q127 275 140 306 M134 247 L142 287 M150 255 L150 294'],
      ['calves','M125 344 Q137 351 141 341 L143 368 L133 416 L126 423 L121 388 Z','M128 352 L126 391 M135 354 L133 390 M138 374 L130 414']
    ],
    back: [
      ['traps','M147 72 L157 76 L157 155 Q145 141 136 119 L119 104 L120 91 Q138 87 147 72 Z','M148 84 L126 96 M153 94 L134 103 M153 105 L139 113 M153 118 L145 128'],
      ['reardelts','M116 91 Q98 86 94 105 L96 122 L108 125 Q110 108 124 106 Z','M113 96 Q103 98 99 110 M117 102 L107 115'],
      ['triceps','M97 127 Q111 126 108 144 L101 167 Q96 174 88 163 L91 144 Z','M98 133 L94 159 M103 135 L99 157'],
      ['forearms','M87 170 L97 177 Q91 201 82 219 L71 219 Q73 192 87 170 Z','M87 180 L76 211 M91 184 L82 209'],
      ['lats','M113 119 L132 125 Q140 145 153 158 L149 192 L137 215 Q118 187 116 163 Z','M118 130 Q124 151 149 166 M118 142 Q124 164 146 177 M120 158 Q128 182 143 188 M124 178 L138 202'],
      ['lowerback','M151 167 L158 159 L158 223 L143 227 L138 218 Q147 194 151 167 Z','M153 180 L152 214 M149 197 L146 217'],
      ['glutes','M135 225 Q145 229 157 229 L157 266 Q143 283 122 267 Q115 249 124 233 Z','M127 237 Q143 233 151 241 M123 246 Q143 240 151 250 M124 256 Q140 252 150 258 M130 266 L145 264'],
      ['hams','M122 275 Q133 282 143 278 L143 310 L137 335 Q129 335 125 321 Z M147 277 L157 270 L154 313 L143 336 L145 306 Z','M128 284 L132 323 M135 286 L137 317 M151 283 L149 312'],
      ['calves','M126 342 Q134 348 141 341 Q148 362 140 385 L133 392 L129 378 L125 389 Q117 373 122 354 Z','M127 351 Q123 366 126 378 M136 351 Q143 368 134 382 M131 351 L131 370']
    ]
  };
  const callouts = {
    front:[['delts',106,101,80,91],['chest',138,115,237,114],['biceps',99,145,77,145],['abs',146,171,244,169],['forearms',83,193,67,206],['obliques',124,185,244,208],['quads',133,278,82,284],['calves',133,373,241,375]],
    back:[['traps',144,105,82,89],['reardelts',107,108,238,106],['triceps',98,146,78,151],['lats',131,163,243,160],['lowerback',149,207,77,215],['glutes',138,251,244,248],['hams',134,300,79,306],['calves',133,363,242,365]]
  };
  const shell = 'M147 69 Q143 82 119 88 Q100 82 93 100 L83 145 Q76 164 76 177 L65 217 L64 229 L58 242 Q56 248 61 248 L66 240 L64 255 Q66 259 69 255 L73 240 L72 257 Q75 260 78 253 L82 238 Q88 242 89 235 L85 224 L101 185 Q108 176 109 157 L115 141 L120 194 L117 225 Q110 246 115 279 L123 331 L119 365 Q116 387 122 416 L121 438 L112 449 Q109 456 120 456 L136 453 L138 421 L146 381 L147 348 L155 319 L159 270 L160 253';
  function figure(view, id, options) {
    const selected = options.selected;
    const region = ([key, shape, fibers]) => {
      const status = options.primary?.has(key) ? 'primary' : options.secondary?.has(key) ? 'secondary' : selected === key ? 'selected' : 'idle';
      const attrs = options.interactive ? `data-mus="${key}" class="muscle-region interactive ${status}" role="button" tabindex="0" aria-label="${names[key]}" aria-pressed="${selected===key}"` : `class="muscle-region ${status}"`;
      return `<g ${attrs} style="fill:url(#${id}-${status})"><title>${names[key]}</title><path d="${shape}"/><path d="${shape}" transform="translate(320 0) scale(-1 1)"/><g class="fibers"><path d="${fibers}"/><path d="${fibers}" transform="translate(320 0) scale(-1 1)"/></g></g>`;
    };
    const labels = options.labels ? callouts[view].map(([key,x,y,tx,ty])=>{
      const right = tx>160, px=right?320-x:x, end=right?tx-5:tx+5;
      return `<g pointer-events="none"><path class="leader" d="M${px} ${y} L${right?226:94} ${ty-3} H${end}"/><circle cx="${px}" cy="${y}" r="2" fill="${selected===key?'#e2baff':'#8c80a5'}"/><text class="map-label ${selected===key?'active':''}" x="${tx}" y="${ty}" text-anchor="${right?'start':'end'}">${names[key]}</text></g>`;
    }).join('') : '';
    return `<g><ellipse cx="160" cy="457" rx="58" ry="6" fill="#080b12" opacity=".5"/><path class="body-shell" d="M145 21 Q160 12 175 21 Q183 31 179 47 L173 61 Q160 73 147 61 L141 47 Q137 31 145 21 Z"/><path class="body-shell" d="${shell} L160 69 Z"/><path class="body-shell" d="${shell} L160 69 Z" transform="translate(320 0) scale(-1 1)"/>${regions[view].map(region).join('')}<g class="tendon"><path d="M160 77 V225 M126 333 Q133 340 141 333 M179 333 Q187 340 194 333 M126 423 L132 437 M188 437 L194 423 M70 223 L81 226 M239 226 L250 223"/>${view==='front'?'<path d="M145 37 Q160 42 175 37 M153 55 Q160 58 167 55 M147 73 L155 91 M173 73 L165 91 M122 219 L156 240 M198 219 L164 240"/>':'<path d="M148 62 Q160 66 172 62 M129 392 L130 430 M191 392 L190 430"/>'}</g>${labels}<text class="view-label" x="160" y="478">${view==='front'?'ANTERIOR · FRONT':'POSTERIOR · BACK'}</text></g>`;
  }
  function render(options={}) {
    const id='atlas-'+(++sequence), view=options.view||'both', both=view==='both';
    const colors={idle:['#74819a','#3e4a60'],selected:['#e6b8ff','#9861d2'],primary:['#ffaf76','#e86137'],secondary:['#b88d73','#79563f']};
    const defs=Object.entries(colors).map(([key,c])=>`<linearGradient id="${id}-${key}" x1="0" y1="0" x2="1" y2=".7"><stop stop-color="${c[0]}"/><stop offset="1" stop-color="${c[1]}"/></linearGradient>`).join('');
    return `<svg class="anatomy" viewBox="0 0 ${both?600:340} 492" xmlns="http://www.w3.org/2000/svg" role="${options.interactive?'group':'img'}" aria-label="${both?'Front and back':view==='front'?'Front':'Back'} muscle map"><defs>${defs}</defs>${both?`<g transform="translate(-10 0)">${figure('front',id,{...options,labels:false})}</g><g transform="translate(290 0)">${figure('back',id,{...options,labels:false})}</g>`:`<g transform="translate(10 0)">${figure(view,id,options)}</g>`}</svg>`;
  }
  return {render,names,regions};
})();
