#说明
*随手撸了个async,肯定不是很靠谱
*函数内部使用await(func():Promise) 来仿造 es7的await func():Promise
*使用asyncFunction=async(rawFunction) 来处理以后就可以直接调用asyncFunction()啦,返回值是一个Promise
```JavaScript
    function someAsyncCode(arg) {
        return new Promise(function (resolve) {
            setTimeout(function () {
                resolve(arg);
            }, 1000);
        });
    }
    function test(a1) {
        var a2 = await(someAsyncCode(a1));
        document.write("step1\n");
        var a3 = await(someAsyncCode(a2));
        document.write("step2\n");
        return a3;
    }
    //
    var testAsync = async(test);
    testAsync(2333333).then(function (result) { document.write(result); });
```