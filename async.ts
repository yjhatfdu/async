/**
 * Created by yjh on 16/2/11.
 */
function async(func) {
    var funcStr = func.toString();
    var funcArgs = funcStr.match(/function[ ]+.+?\((.*?)\)/)[1];
    funcStr = funcStr.replace(/\n/g, '');
    var returnLine = funcStr.match(/return +(.+?)[ ;}]/);
    funcStr = funcStr.replace(returnLine[0], `__resolve(${returnLine[1]})`);
    var funcBody = funcStr.match(/function +.+?\(.*?\) *\{(.*)}/)[1];
    var varEqual = funcBody.match(/var .+?=/g);
    var variableList = [];
    varEqual.map(function (item) {
        funcBody = funcBody.replace(item, item.match(/var (.+)/)[1]);
        variableList.push(item.match(/var (.+)=/)[1].trim())
    });
    var vars = funcBody.match(/var .+?;/g) || [];
    vars.map(function (item) {
        funcBody = funcBody.replace(item, '');
        var vars = item.match(/var (.+?);/)[1];
        variableList.push(...vars.trim().split(','))
    });

    var awaitLines = funcBody.split(';').filter(v=>/.*await\(.*\)/.test(v));


    function buildAwaitBlock(awaitLine) {
        var awaitFunc = awaitLine.trim().match(/await\((.+)\)/)[1];
        var left = awaitLine.trim().match(/(.*)await\(.*/)[1];
        if (left.length > 0) {
            left = left + '__r';
        }
        return `${awaitFunc}.then(function(__r){${left};__wrapper()});`
    }

    function getSwitchBlock(str, awaitBlock, stage) {
        return `case ${stage}:{__stage++;${str}${awaitBlock};break}`
    }

    var switchBlock = '';
    var leftPart, rightPart;
    var stage = 0;
    rightPart = funcBody;
    for (let i = 0; i < awaitLines.length; i++) {
        [leftPart, rightPart] = rightPart.split(awaitLines[i]);
        switchBlock += getSwitchBlock(leftPart, buildAwaitBlock(awaitLines[i]), stage);
        stage++
    }
    switchBlock += getSwitchBlock(rightPart, '', stage);

    var returnFunc = `return function(${funcArgs}){var __stage=0;var __resolve;${variableList.map(item=>'var ' + item).join(';')};
	function __wrapper(){switch (__stage){${switchBlock}}}var __promise = new Promise(function(r){__resolve=r;});
	   __wrapper();return __promise;}`;
    return (new Function(returnFunc))()
}


declare function await(p:Promise<any>);

//demo
function asyncRun(func){
    async(func)()
}

function someAsyncCode(arg) {
    return new Promise(function (resolve) {
        setTimeout(function () {
            resolve(arg)
        }, 1000);
    })
}

function test(a1) {
    var a2 = await(someAsyncCode(a1));
    console.log(1);
    var a3 = await(someAsyncCode(a2));
    console.log(2);
    return a3;
}
//
var testAsync = async(test);


testAsync(2333333).then((result)=>console.log(result));