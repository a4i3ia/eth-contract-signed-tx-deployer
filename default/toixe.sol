pragma solidity ^0.4.24;

contract Toixe {

    string public data;

    function read() public returns(string) {
        return data;
    }

    function write(string _data) public{
        data = _data;
    }
}