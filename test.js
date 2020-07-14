let a = {a: {a:3}};
let b = a;

console.log(a.a.a);
console.log(b.a.a);
a.a.a++;
console.log(a.a.a);
console.log(b.a.a);

let adder = (obj) => {
    obj.a.a = "test";
    return [obj,obj]
};
function adder2(obj) {
    obj.a.a = {};
    return [obj,obj];
}
let c = adder(a);
let c2 = adder2(a);
let cc1 = c[0];
let cc2 = c[1];
console.log(a.a.a);
console.log(b.a.a);
console.log(cc1.a.a);
console.log(cc2.a.a);
console.log(a === b);
console.log(a === cc1);
console.log(cc1 === b);

console.log(a === cc2);
console.log(cc2 === b);