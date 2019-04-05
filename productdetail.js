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
    StatusBar,
    Stylesheet,
    Modal,
    AsyncStorage,
    FlatList,
    ActivityIndicator,
    Linking,
    BackHandler
} from 'react-native';
var { height, width } = Dimensions.get('window');
const Styles = require('@styles/common.style');
const styles = require('@styles/producdetail.style');
import Carousel from 'react-native-snap-carousel';
import Statusbar from './statusbar';
import moment from 'moment';
import { Singleproduct, Relatedtitems } from '@lib';
import { NavigationActions } from 'react-navigation';
import Share, { ShareSheet, Button } from 'react-native-share';
import {
    AdMobBanner,
    AdMobInterstitial,
    PublisherBanner,
    AdMobRewarded,
} from 'react-native-admob';

var { height, width } = Dimensions.get('window');
const horizontalMargin = 20;
const slideWidth = 280;
const sliderWidth = width;
const itemWidth = slideWidth + horizontalMargin * 2;
const itemHeight = 200;

class Productdetail extends Component {
    constructor(props) {
        super(props);

        this.state = {
            description: true,
            cID: this.props.navigation.state.params.p,
            c: this.props.navigation.state.params && this.props.navigation.state.params.c ? this.props.navigation.state.params.c : '',
            vai: this.props.navigation.state.params && this.props.navigation.state.params.vai ? this.props.navigation.state.params.vai : '',
            activeId: 0,
            loader: false,
            relatedtitems: [],
        }
        this.relatedSingleItem = this.relatedSingleItem.bind(this);
    }

    componentWillMount = async () => {
        let result = await AsyncStorage.getItem('user');
        this.setState({ islogin: (result !== null), });

        this.getSingleProductItem(this.state.cID);
        Relatedtitems(this.state.cID).then((r) => {
            if (r.status == '1') {
                this.setState({
                    relatedtitems: r.data
                })
            } else {
                this.setState({ loader: false });
            }
        });
    }

    getSingleProductItem = (id) => {
        Singleproduct(id).then((r) => {
            if (r.status == '1') {
                this.setState({
                    productDetail: r.data,
                    loader: false
                })
            } else {
                this.setState({ loader: false });
            }
        });
    }

    relatedSingleItem = (item, id) => {
        this.getSingleProductItem(id);
    }

    _renderItem({ item, index }) {

        if (item.productImages && item.productImages.length > 0) {
            return (
                <TouchableOpacity style={styles.slide} key={index} onPress={() => { this.relatedSingleItem(item, item.id) }}>
                    <Image style={{ flex: 1 }} source={{ uri: item.productImages[0] }} />
                    <Text style={[styles.tabDescriptionText, { marginVertical: 10 }]} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.bannerPrice}>₹ {item.price}</Text>
                </TouchableOpacity>
            );
        }
    }

    loader = () => {
        if (this.state.loader) {
            return (<View style={{
                top: 0, position: 'absolute', width: '100%', height: '100%',
                justifyContent: 'center', backgroundColor: '#e4e4e4', opacity: 0.4
            }}><ActivityIndicator size="large" color="#0093dd" /></View>)
        }
    }

    render() {
        return (
            <View>
                <Statusbar />
                <View style={Styles.headerBackground}>
                    <TouchableOpacity onPress={() => { this.props.navigation.goBack(); }} style={Styles.backBtn}>
                        <Image style={Styles.backIcon} source={require('@images/backArrow.png')} />
                    </TouchableOpacity>
                    <Text style={Styles.headerTitle}>App Name Removed Temporary</Text>
                    {/* {this.state.islogin && */}
                    <TouchableOpacity onPress={() => { Share.open({ url: this.state.productDetail && this.state.productDetail.productdetails && this.state.productDetail.productdetails.slug }); }} style={{ marginRight: 10 }}>
                        <Image style={styles.shareIcon} source={require('@images/share_icon.png')} />
                    </TouchableOpacity>
                    {/* } */}
                </View>
                <View style={Styles.contentAreahf}>
                    <ScrollView bounces={false} showsVerticalScrollIndicator={false} >

                        <View style={styles.whitebackground}>
                            <Text style={styles.productLabel} >{this.state.productDetail && this.state.productDetail.productdetails && this.state.productDetail.productdetails.condition}</Text>
                            {this.state.productDetail && this.state.productDetail.productimage && this.state.productDetail.productimage[this.state.activeId] ?
                                <Image cache='only-if-cached' style={styles.productImage} source={{ uri: this.state.productDetail.productimage[this.state.activeId] }} /> : <View style={{
                                    top: 0, position: 'absolute', width: '100%', height: '100%',
                                    justifyContent: 'center', backgroundColor: '#e4e4e4', opacity: 0.4
                                }}>
                                    <ActivityIndicator size="large" color="#0093dd" /></View>
                            }
                            <ScrollView contentContainerStyle={styles.thumbItem} horizontal={true} showsHorizontalScrollIndicator={false}>
                                <FlatList
                                    horizontal={true}
                                    keyExtractor={(item, index) => index.toString()}
                                    style={{ flex: 1 }}
                                    data={this.state.productDetail && this.state.productDetail.productimage && this.state.productDetail.productimage.length > 0 ? this.state.productDetail.productimage : []}
                                    renderItem={(v) => {
                                        return (<TouchableOpacity key={v.index.toString()} style={[styles.thumbBtn, this.state.activeId == v.index && styles.activeThumbBtn]} onPress={() => { this.setState({ activeId: v.index }); }}>
                                            <Image style={styles.thumbImage} source={{ uri: v.item }} />
                                        </TouchableOpacity>)
                                    }
                                    } />
                            </ScrollView>
                        </View>
                        <View style={styles.whitebackground}>
                            <Text style={styles.productTitle}>{this.state.productDetail && this.state.productDetail.productdetails && this.state.productDetail.productdetails.title}</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5, marginBottom: 10, }}>
                                <Text style={styles.currency}>₹ </Text>
                                <Text style={styles.price}> {this.state.productDetail && this.state.productDetail.productdetails && this.state.productDetail.productdetails.price} </Text>
                            </View>
                            <View style={[styles.flexDirectionRow]}>
                                <View style={styles.flexDirectionRow}>
                                    <Image style={styles.timeIcon} source={require('@images/watch_icon.png')} />
                                    <Text style={styles.time}>{this.state.productDetail && this.state.productDetail.productdetails && moment(this.state.productDetail.productdetails.created_at).format('llll')}</Text>
                                </View>
                                <View style={styles.flexDirectionRow}>
                                    <Image style={styles.viewIcon} source={require('@images/eyes_view_icon.png')} />
                                    <Text style={styles.time}>Ad Views : {this.state.productDetail && this.state.productDetail.view}</Text>
                                </View>
                            </View>
                        </View>
                        <View style={styles.tabBackground}>
                            <View style={styles.flexDirectionRow}>
                                <TouchableOpacity style={[styles.tabBtn, styles.descriptionBtn, this.state.description && styles.activeTabBtn]} onPress={() => { this.setState({ description: true }) }}>
                                    <Text style={[styles.tabBLabel, this.state.description && styles.activeTabLabel]}>Description</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.tabBtn, !this.state.description && styles.activeTabBtn]} onPress={() => { this.setState({ description: false }) }}>
                                    <Text style={[styles.tabBLabel, !this.state.description && styles.activeTabLabel]}>Location</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={[styles.tabDescriptionView]}>
                                {this.state.description && <Text style={[styles.tabDescriptionText]}>{this.state.productDetail && this.state.productDetail.productdetails && this.state.productDetail.productdetails.description}</Text>}
                                {!this.state.description && <Text style={[styles.tabDescriptionText]}>{this.state.productDetail && this.state.productDetail.productdetails && this.state.productDetail.productdetails.place}</Text>}
                            </View>
                        </View>
                        <View style={[styles.whitebackground, styles.flexDirectionRow]}>
                            <View style={styles.flexDirectionRow}>
                                {this.state.productDetail && this.state.productDetail.ownerdetails && <Image style={styles.iStoreLogo} source={{ uri: this.state.productDetail.ownerdetails.profileImage }} />}
                                {this.state.islogin && <Text style={styles.iStoreLabel}>{this.state.productDetail && this.state.productDetail.ownerdetails && this.state.productDetail.ownerdetails.firstName + ' ' + this.state.productDetail.ownerdetails.lastName}</Text>}
                                {!this.state.islogin && <Text style={styles.iStoreLabel}>{this.state.productDetail && this.state.productDetail.ownerdetails && this.state.productDetail.ownerdetails.firstName}</Text>}
                            </View>
                            {this.state.islogin &&
                                <View style={styles.contactBtnBack}>
                                    <TouchableOpacity onPress={() => { Linking.openURL('tel:' + this.state.productDetail.ownerdetails.phoneNumber); }}>
                                        <Image style={styles.callIcon} source={require('@images/callIcon.png')} />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => { Linking.openURL('whatsapp://send?phone=' + this.state.productDetail.ownerdetails.phoneNumber); }} >
                                        <Image style={styles.callIcon} source={require('@images/whattsup.png')} />
                                    </TouchableOpacity>
                                </View>
                            }
                            {!this.state.islogin &&
                                <View>
                                    <TouchableOpacity style={styles.clickToContactBtn} onPress={() => { this.props.navigation.navigate('Login'); }} >
                                        <Text style={{ fontSize: 15, color: '#fff' }} >
                                            Click to Contact
                                   </Text>
                                    </TouchableOpacity>
                                </View>
                            }
                        </View>
                        {/* <View style={styles.socialMediaSection}>
                        <TouchableOpacity>
                            <Image style={styles.socilaIcon} source={require('@images/twitter_icon.png')} />
                        </TouchableOpacity>
                        <TouchableOpacity>
                            <Image style={styles.socilaIcon} source={require('@images/fb_icon.png')} />
                        </TouchableOpacity>
                        <TouchableOpacity>
                            <Image style={styles.socilaIcon} source={require('@images/google_plus_icon.png')} />
                        </TouchableOpacity>
                    </View> */}
                        <Text style={styles.relatedItemLabel}>
                            RELETED ITEMS
                    </Text>
                        <Carousel
                            data={this.state.relatedtitems}
                            loop={true}
                            autoplay={true}
                            autoplayInterval={3000}
                            renderItem={this._renderItem.bind(this)}
                            sliderWidth={sliderWidth}
                            itemWidth={itemWidth}
                            activeAnimationType={'spring'}
                            hasParallaxImages={true}
                        />
                    </ScrollView>
                </View>

                {/* {this.loader()} */}

                <View style={{ alignSelf: 'center', width: (width) }}>
                    <View style={Styles.admobbanner}>
                        <AdMobBanner adSize="fullBanner"
                            adUnitID={adId}
                            testDevices={[AdMobBanner.simulatorId]}
                            onAdFailedToLoad={error => console.error(error)} />
                    </View>
                </View>
            </View>
        );
    }
}

export default Productdetail;
