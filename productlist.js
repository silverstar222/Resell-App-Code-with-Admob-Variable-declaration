/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
    Platform,
    StyleSheet,
    Text,
    View,
    Image,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Dimensions,
    Modal,
    FlatList,
    AsyncStorage,
    ActivityIndicator,
} from 'react-native';
var { height, width } = Dimensions.get('window');
const Styles = require('@styles/common.style');
const styles = require('@styles/productlist.style');
const searchStyles = require('@styles/serach.style');
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import Custommarker from '@screen/custommarker';
import Statusbar from './statusbar';
import SideMenu from 'react-native-side-menu';
import Menu from './menu';
import { Productlist, Productsearchlist, Catsubcat, Sliderrange } from '@lib';
import RadioForm, { RadioButton, RadioButtonInput, RadioButtonLabel } from 'react-native-simple-radio-button';
import CheckBox from 'react-native-check-box';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

import {
    AdMobBanner,
    AdMobInterstitial,
    PublisherBanner,
    AdMobRewarded,
} from 'react-native-admob';
const conditionType = [
    { label: 'Used', value: 0 },
    { label: 'Brand New', value: 1 },

];

class ProductList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            drawerIsOpen: false,
            filterModal: false,
            searchModal: false,
            multiSliderValue: [Number(sldRange.pricemin), Number(sldRange.pricemax)],
            c: this.props.navigation.state.params && this.props.navigation.state.params.c,
            condition: 'Old',
            togglePriceMenu: false,
            priceOrderLabel: 'Sort By Price',
            loader: false,
            showMessage: false,
            allCategoryId: [],
            isShowRefreshButton: false,
            isRefreshing: false,
            listProduct: [],
            next_url: 'Remove Temporary',
        }
    }

    multiSliderValuesChange = (values) => {
        this.setState({ multiSliderValue: values, });
    }



    componentWillMount = async () => {
        let result = await AsyncStorage.getItem('user');
        this.setState({ loader: true, islogin: (result !== null), loginData: JSON.parse(result) });
        let id = [];
        id.push(this.state.c.id);
        this.getProduct(this.state.next_url, id, '', '', '', '');
        this.mainCategory();
    }

    mainCategory = () => {
        Catsubcat().then((r) => {
            if (r.status == '1') {
                this.setState({ categoryList: r.data, categoryListcopy: r.data });
            }
        });
    }

    filterProduct = (po, url) => {
        this.setState({ loader: true, listProduct: [] });
        let allId = [];
        allId = Object.keys(this.state.allCategoryId);
        allId.push(this.state.c.id);
        this.getProduct(url, allId, this.state.condition, this.state.multiSliderValue[0], this.state.multiSliderValue[1], po);
    }

    getProduct = (url, id, c, minp, maxp, p) => {
        Productlist(url, id, c, minp, maxp, p).then((r) => {
            if (r.status == '1') {
                this.setState({
                    listProduct: this.state.listProduct.concat(r.testdata.data),
                    next_url: r.testdata.next_page_url,
                    count: r.count,
                    condition: 'Old',
                    loader: false,
                    showModalMessage: false,
                    filterModal: false,
                    showMessage: false,
                    messageText: '',
                })
            } else {
                this.setState({ count: r.count, loader: false, showMessage: true, messageText: r.msg, listProduct: [] });
            }
        });
    }

    getFirstImages = (p) => {
        if (p && p.image) {
            return (<Image style={styles.productImage} source={{ uri: p.image }} />)
        }
    }

    searchResult = () => {
        if (!this.state.productName && !this.state.latitude && !this.state.longitude) return;
        Productsearchlist(this.state.productName, this.state.latitude, this.state.longitude).then((r) => {
            if (r.status == '1') {
                this.setState({ listProduct: r.data, searchModal: false, latitude: '', longitude: '', productName: '', count: r.data.length })
            } else {
                this.setState({ showModalMessage: true, messageText: 'Your search did not match any products!', latitude: '', longitude: '' })
            }
        });
    }

    clearSearch = () => {
        let t = [];
        t.push(this.state.c.id);
        this.setState({ loader: true, listProduct: [] });
        this.getProduct('Remove Temporary', t, '', '', '', '');
        this.mainCategory();
    }

    loader = () => {
        if (this.state.loader) {
            return (<View style={{
                top: 0, position: 'absolute', width: '100%', height: '100%',
                justifyContent: 'center', backgroundColor: '#e4e4e4', opacity: 0.4
            }}><ActivityIndicator size="large" color="#0093dd" /></View>)
        }
    }

    updateMenuState = (isOpen) => {
        this.setState({ drawerIsOpen: isOpen });
    }

    filterSubCategory = (i, v, subC, subCI) => {
        if (this.state.categoryList[v] && this.state.categoryList[v].sub_category[subCI].isChecked) {
            this.state.categoryList[v].length = this.state.categoryList[v].length - 1;
            delete this.state.categoryList[v].sub_category[subCI].isChecked;
            delete this.state.allCategoryId[subC.id];
            delete this.state.allCategoryId[i.id];
            this.setState({ categoryList: this.state.categoryList, allCategoryId: this.state.allCategoryId });
        } else {
            this.state.categoryList[v].sub_category[subCI].isChecked = true;
            this.state.allCategoryId[subC.id] = { t: true };
            this.state.allCategoryId[i.id] = { t: true };
            this.state.categoryList[v].length = this.state.categoryList[v].length ? this.state.categoryList[v].length + 1 : 1;
            this.setState({ categoryList: this.state.categoryList, allCategoryId: this.state.allCategoryId });
        }
    }

    allSubCategory = (i, v) => {
        if (this.state.categoryList && this.state.categoryList.length > 0 && this.state.categoryList[v].sub_category) {
            return this.state.categoryList[v].sub_category.map((subC, subCI) => {
                return (<CheckBox
                    key={i.id + 'sub_category' + (i.id * i.id)}
                    style={{ padding: 5, marginLeft: 20 }}
                    onClick={() => { this.filterSubCategory(i, v, subC, subCI) }}
                    isChecked={subC.isChecked}
                    rightText={subC.value}
                    rightTextStyle={{ color: '#6d6d6d', fontFamily: 'Roboto-Regular', fontSize: 18, }}
                    checkedImage={<Image source={require('@images/check.png')} style={styles.checkBoxIcon} />}
                    unCheckedImage={<Image source={require('@images/uncheck.png')} style={styles.checkBoxIcon} />}
                />)
            })
        }
    }

    sidebarToggle = () => {
        this.setState({ drawerIsOpen: !this.state.drawerIsOpen });
    }


    filterCategory = (data, v) => {
        if (this.state.categoryList[v] && (this.state.categoryList[v].length && this.state.categoryList[v].sub_category) && (this.state.categoryList[v].length == this.state.categoryList[v].sub_category.length)) {
            this.state.categoryList[v].sub_category.map((p, q) => {
                delete this.state.categoryList[v].sub_category[q].isChecked;
                delete this.state.allCategoryId[p.id];
            });
            delete this.state.categoryList[v].length;
            delete this.state.allCategoryId[data.id];
            this.setState({ categoryList: this.state.categoryList });
        } else {
            this.state.categoryList[v].sub_category.map((p, q) => {
                this.state.categoryList[v].sub_category[q].isChecked = true;
                this.state.allCategoryId[p.id] = { t: true };
            });
            this.state.allCategoryId[data.id] = { t: true };
            this.state.categoryList[v].length = this.state.categoryList[v].sub_category.length;
            this.setState({ categoryList: this.state.categoryList, allCategoryId: this.state.allCategoryId });
        }
    }

    showSubCategory = (i, v) => {
        if (this.state.categoryList[v] && this.state.categoryList[v].isShowSubCAtegory) {
            delete this.state.categoryList[v].isShowSubCAtegory;
            this.setState({ categoryList: this.state.categoryList });
        } else {
            this.state.categoryList[v].isShowSubCAtegory = true;
            this.setState({ categoryList: this.state.categoryList });
        }
    }

    allCategory = () => {
        if (this.state.categoryList && this.state.categoryList.length > 0) {
            return this.state.categoryList.map((i, v) => {
                return (
                    <View key={i.id + 'category'}>
                        <View style={{ borderColor: '#dddddd', borderWidth: 1, backgroundColor: '#f5f5f5' }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
                                <CheckBox
                                    style={{ padding: 10, }}
                                    onClick={() => { this.filterCategory(i, v) }}
                                    isChecked={(i.length == i.sub_category.length)}
                                    checkedImage={<Image source={require('@images/check.png')} style={styles.checkBoxIcon} />}
                                    unCheckedImage={<Image source={require('@images/uncheck.png')} style={styles.checkBoxIcon} />}
                                />
                                <TouchableOpacity onPress={() => { this.showSubCategory(i, v) }} style={{ flex: 1, padding: 10 }}>
                                    <Text style={{ color: '#6d6d6d', fontFamily: 'Roboto-Medium', fontSize: 18, }}>{i.value}</Text>
                                </TouchableOpacity>
                                {i.sub_category.length > 0 && <Image style={[styles.arrowIcon, { marginRight: 20, }]} source={require('@images/drop_down.png')} />}
                            </View>
                        </View>
                        {i.isShowSubCAtegory && this.allSubCategory(i, v)}
                    </View>
                )
            })
        }
    }


    moreProduct = () => {
        this.setState({
            next_url: this.state.next_url,
        }, () => {
            let t = [];
            t.push(this.state.c.id);
            this.getProduct(this.state.next_url, t, '', '', '', '');
        });
    }

    handleRefresh = () => {
        this.setState({
            next_url: this.state.next_url,
            isRefreshing: true,
        }, () => {
            let t = [];
            t.push(this.state.c.id);
            this.getProduct(this.state.next_url, t, '', '', '', '');
        });
    }

    render() {
        let menu = <Menu navigation={this.props.navigation} islogin={this.state.islogin} loginData={this.state.loginData} />;
        return (
            <SideMenu
                menu={menu}
                isOpen={this.state.drawerIsOpen}
                openMenuOffset={width - 80}
                disableGestures={true}
                onChange={(isOpen) => { this.updateMenuState(isOpen) }}
                bounceBackOnOverdraw={false}>
                <Statusbar />
                <View>
                    <View style={Styles.headerBackground1}>

                        <View style={Styles.headerBackground2}>
                            <TouchableOpacity onPress={() => { this.sidebarToggle() }} style={Styles.backBtn} >
                                <Image style={Styles.menuIcon} source={require('@images/menuIcon.png')} />
                            </TouchableOpacity>
                            <Text style={Styles.headerTitle}>App Name Removed Temporary</Text>
                            {this.state.isShowRefreshButton &&
                                <TouchableOpacity onPress={() => { this.setState({ isShowRefreshButton: false }); this.clearSearch(); }} style={{ paddingHorizontal: 8, }}>
                                    <Image style={Styles.refreshIcon} source={require('@images/refersh.png')} />
                                </TouchableOpacity>
                            }
                            <TouchableOpacity onPress={() => { this.setState({ searchModal: true }); }} style={{ paddingHorizontal: 8 }}>
                                <Image style={Styles.searchIcon} source={require('@images/searchIcon.png')} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => { this.props.navigation.goBack(); }} style={{ paddingHorizontal: 8 }}>
                                <Image style={Styles.homeIcon} source={require('@images/white_home_icon.png')} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.filterArea}>
                            <View style={[styles.filterBtn, styles.filterBtnRightBorder]}>
                                <TouchableOpacity style={styles.filterInner} onPress={() => { this.setState({ filterModal: true }) }}>
                                    <Image style={styles.filterIcon} source={require('@images/fillter_icon.png')} />
                                    <Text style={styles.filterBtnText}>Filter</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.filterBtn}>
                                <TouchableOpacity style={styles.filterInner} onPress={() => { this.setState({ togglePriceMenu: !this.state.togglePriceMenu }); }}>
                                    <Image style={styles.orderByIcon} source={require('@images/sortingAsc.png')} />
                                    <Text style={styles.filterBtnText}>{this.state.priceOrderLabel}</Text>
                                    <Image style={styles.arrowIcon} source={require('@images/drop_down.png')} />
                                </TouchableOpacity>
                            </View>
                        </View>
                        <Text style={styles.resultText}> {this.state.count} Result for <Text style={styles.bold}>“{this.state.c.name}”</Text></Text>
                    </View>
                    {this.state.togglePriceMenu && <View style={styles.allToggleBox}>
                        <Image style={styles.arrow} source={require('@images/drop_down.png')} />
                        <View style={styles.drdback}>
                            <TouchableOpacity onPress={() => { this.setState({ togglePriceMenu: !this.state.togglePriceMenu, priceOrderLabel: 'Price Hight to Low' }), this.filterProduct('high', 'Remove Temporary'); }}>
                                <Text style={[styles.priceTypeText, styles.borderBottomMenu]}>Price High to Low</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => { this.setState({ togglePriceMenu: !this.state.togglePriceMenu, priceOrderLabel: 'Price Low to High' }), this.filterProduct('low', 'Removed Temporary'); }}>
                                <Text style={styles.priceTypeText}>Price Low to High</Text>
                            </TouchableOpacity>
                        </View>
                    </View>}
                    <View style={Styles.contentAreahpList}>
                        <ScrollView bounces={false} showsVerticalScrollIndicator={false} >
                            {this.state.showMessage &&
                                <Text style={Styles.emptyListMessage}>{this.state.messageText}</Text>
                            }
                            <FlatList
                                initialNumToRender={5}
                                refreshing={this.state.isRefreshing}
                                onRefresh={() => { this.handleRefresh() }}
                                onEndReached={() => {
                                    if (this.state.next_url) {
                                        this.moreProduct();
                                    }
                                }}
                                numColumns={2}
                                keyExtractor={(item, index) => item.id.toString()}
                                style={{ flex: 1 }}
                                data={this.state.listProduct && this.state.listProduct.length > 0 ? this.state.listProduct : []}
                                renderItem={(v) => <TouchableOpacity key={v.index} style={[styles.singleProductBox, styles.singleProductRightBorder]} onPress={() => { this.props.navigation.navigate('Productdetail', { p: v.item.id, c: this.state.c }); }}>
                                    <Text style={styles.productLabel} >{v.item.condition}</Text>
                                    {this.getFirstImages(v.item.image[0])}

                                    <View style={{ padding: 5 }}>
                                        <Text numberOfLines={2} style={styles.productTitle}>{v.item.title}</Text>
                                        <View style={styles.priceSection}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                                                <Text style={styles.currency}>₹ </Text>
                                                <Text style={styles.price}> {v.item.price}</Text>
                                            </View>
                                            <View style={{ padding: 3, flexDirection: 'row', alignItems: 'center', backgroundColor: '#cbcbcb', borderRadius: 5, }}>
                                                <Image style={styles.imgIcon} source={require('@images/img_icon.png')} />
                                                <Text style={styles.imgNumber}> {v.item.image.length}</Text>
                                            </View>
                                        </View>
                                    </View>
                                </TouchableOpacity>} />
                        </ScrollView>
                    </View>
                </View>
                <View style={{ alignSelf: 'center', width: (width) }}>
                    <View style={Styles.admobbanner}>
                        <AdMobBanner adSize="fullBanner"
                            adUnitID={adId}
                            testDevices={[AdMobBanner.simulatorId]}
                            onAdFailedToLoad={error => console.error(error)} />
                    </View>
                </View>
                <Modal animationType="slide" transparent={true}
                    visible={this.state.searchModal} onRequestClose={() => { this.state.searchModal }}>
                    <View style={searchStyles.searchBack}>

                        <View style={searchStyles.sModalBack}>
                            <TouchableOpacity style={searchStyles.searchCloseBtn} onPress={() => { this.setState({ searchModal: false }) }}>
                                <Text style={searchStyles.searchModalTitleText}>X</Text>
                            </TouchableOpacity>
                            <View style={searchStyles.searchModalTitle}>
                                <Image style={searchStyles.searchModalTitleIcon} source={require('@images/searchingIcon.png')} />
                                <Text style={searchStyles.searchModalTitleText}>Search</Text>
                            </View>
                            <View style={searchStyles.inputRow}>
                                <Image style={searchStyles.logiIcon} source={require('@images/serach2.png')} />
                                <TextInput onChangeText={(t) => { this.productSearch(t) }} underlineColorAndroid='transparent'
                                    placeholderTextColor="#c7c7c7"
                                    autoFocus={true}
                                    placeholder="What are you looking for...?"
                                    onChangeText={(productName) => { this.setState({ productName: productName }); }}
                                    onFocus={() => { this.setState({ showModalMessage: false, messageText: '' }) }}
                                    style={searchStyles.loginInput} />
                            </View>
                            <View style={[searchStyles.inputRow, searchStyles.marginTop15]}>
                                <GooglePlacesAutocomplete
                                    placeholder="Location"
                                    returnKeyType={"done"}
                                    listViewDisplayed="auto"
                                    fetchDetails={true}
                                    value={this.state.location}
                                    renderDescription={row => row.description}
                                    onFocus={() => { this.setState({ showModalMessage: false, messageText: '' }) }}
                                    onPress={(data, details = null) => {
                                        this.setState({ latitude: details.geometry.location.lat, longitude: details.geometry.location.lng })
                                    }}
                                    renderLeftButton={() => <Image style={searchStyles.searchModalTitleIcon2} source={require('@images/search_location_icon.png')} />}
                                    query={{
                                        key: 'AIzaSyAGF8cAOPFPIKCZYqxuibF9xx5XD4JBb84',
                                        language: 'en',
                                        types: 'address',
                                    }}
                                    styles={{
                                        textInputContainer: {
                                            backgroundColor: '#FFF',
                                            borderTopWidth: 0,
                                            borderBottomWidth: 0,
                                            paddingHorizontal: 15,
                                            paddingLeft: 15,
                                            alignItems: 'center',
                                            flexDirection: 'row',
                                            width: '100%',
                                            backgroundColor: '#FFF',
                                            borderRadius: 25,
                                            elevation: 3,
                                            shadowColor: '#000000',
                                            shadowOffset: {
                                                width: 0.5,
                                                height: 3,
                                            },
                                            shadowRadius: 1,
                                            shadowOpacity: 0.5,
                                        },
                                        textInput: {
                                            backgroundColor: '#FFF',
                                            paddingRight: 0,
                                            marginTop: 0,
                                            marginLeft: 0,
                                            marginRight: 0,
                                            fontFamily: 'Roboto-Regular',
                                            color: '#c7c7c7',
                                            fontSize: 16,
                                            height: 45,
                                            borderRadius: 25,
                                        },
                                        description: {
                                            fontWeight: 'bold'
                                        },
                                        predefinedPlacesDescription: {
                                            color: '#1faadb'
                                        }
                                    }}
                                    debounce={200}
                                    onFocus={() => { this.setState({ locationMessage: '' }); }}
                                />
                            </View>
                            {this.state.showModalMessage &&

                                <Text style={Styles.emptyListMessage}>{this.state.messageText}</Text>
                            }

                            <TouchableOpacity style={searchStyles.searchBtn} onPress={() => { this.setState({ isShowRefreshButton: true }), this.searchResult(); }}>
                                <Image style={searchStyles.searchBtnIcon} source={require('@images/searchBtn.png')} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
                <Modal animationType="slide"
                    transparent={true}
                    visible={this.state.filterModal} onRequestClose={() => { this.state.filterModal }} style={{ maerginTop: 20, }}>
                    <View style={{ backgroundColor: 'rgba(255,255,255,0.5)', flex: 1, }}>
                        <View style={styles.modalBack}>

                            <View style={{ paddingHorizontal: 10, flex: 1 }}>
                                <ScrollView bounces={false} showsVerticalScrollIndicator={false}>

                                    <View >
                                        <View style={{ paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#c2c2c2', marginBottom: 25 }}>
                                            <Text style={styles.rangeTitle}>Condition</Text>
                                            <RadioForm
                                                style={{ flexDirection: 'row' }}
                                                radio_props={conditionType}
                                                initial={0}
                                                buttonSize={10}
                                                labelStyle={{ fontSize: 18, paddingRight: 20, color: "#b1b1b1", paddingLeft: 5, fontFamily: 'Roboto-Regular' }}
                                                onPress={(value) => { this.setState({ condition: value }) }}
                                            />
                                        </View>
                                    </View>
                                    <Text style={styles.rangeTitle}>Select Price Range</Text>
                                    <View style={{ alignItems: 'center', marginTop: 20, marginBottom: 10, }}>
                                        <MultiSlider
                                            selectedStyle={{
                                                backgroundColor: '#0487cd',
                                            }}
                                            trackStyle={{
                                                backgroundColor: '#d7d7d7',
                                                height: 8,
                                                borderRadius: 10,
                                                marginTop: -4,
                                            }}
                                            touchDimensions={{
                                                height: 10,
                                                width: 10,
                                                borderRadius: 15,
                                                slipDisplacement: 30,
                                            }}
                                            containerStyle={{
                                                height: 15,
                                            }}
                                            values={[this.state.multiSliderValue[0], this.state.multiSliderValue[1]]}
                                            sliderLength={width * (0.8) - 10}
                                            onValuesChange={this.multiSliderValuesChange}
                                            min={this.state.multiSliderValue[0]}
                                            max={this.state.multiSliderValue[1]}
                                            step={200}
                                            customMarker={Custommarker}
                                        />
                                    </View>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#c2c2c2', }}>
                                        <Text style={styles.rangePrice}>₹ {this.state.multiSliderValue.length > 0 && this.state.multiSliderValue[0]}</Text>
                                        <Text style={styles.rangePrice}>₹ {this.state.multiSliderValue.length > 0 && this.state.multiSliderValue[1]}</Text>
                                    </View>
                                    <View>
                                        <View>
                                            {this.allCategory()}
                                        </View>
                                    </View>
                                </ScrollView>
                            </View>
                            <View style={{ flexDirection: 'row' }}>
                                <TouchableOpacity style={[styles.filterBtnModal, styles.filterBlueBtn]} onPress={() => { this.setState({ filterModal: false, isShowRefreshButton: true }); this.filterProduct('', 'Remove Temporary') }} >
                                    <Text style={[styles.filterBtnModalText, styles.filterBlueBtnText]}>Filter</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.filterBtnModal, styles.clearGrayBtn]} onPress={() => { this.clearSearch() }}>
                                    <Text style={[styles.filterBtnModalText, styles.clearGrayBtnText]}>Clear</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
                {this.loader()}
            </SideMenu>
        );
    }
}

export default ProductList;
