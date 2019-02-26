'use strict';

const cfg = require('../cfg/peron');
const Logger = require('./logger');
const log = new Logger('[lib/jobs]');

const STATES = { INTENT: 0, ORDER: 1, FILLED: 2, POSITION: 3, STOP: 4 };

const jobs = [];

let interval = null;
let quote = {};
let candle = null;

function create (sym, qty, px, state, t)
{
  if (jobs.length >= cfg.broker.max_jobs) { log.log('max amount of jobs'); return; }

  const job = { id: genId(), sym: sym, qty: qty, px: px, state: state, t: t };

  log.info('Job Created', job);
  // TODO: track job change somewhere

  jobs.push(job);
  process(job);

  if (!interval) { interval = setInterval(run, cfg.broker.interval); }
}

function update (job, qty, px, state, t)
{
  job.qty = qty;
  job.px = px;
  job.state = state;
  job.t = t;

  log.info('Job Updated', job);
  // TODO: track job change somewhere
}

function destroy (job)
{
  jobs.splice(jobs.findIndex(j => j.id === job.id), 1);

  log.info('Job Destroyed', job);
  // TODO: track job change somewhere
}

function run ()
{
  for (let i = jobs.length - 1; i > -1; i--){ process (jobs[i]); }
  if (jobs.length == 0) { clearInterval(interval); }
}

// TODO: extract this to it's own file?
function process (job)
{
  switch (job.state){
    case STATES.INTENT: proccessIntent(job); break;
    case STATES.ORDER: proccessOrder(job); break;
    case STATES.FILLED: proccessFilled(job); break;
    case STATES.POSITION: proccessPosition(job); break;
    case STATES.DONE: proccessDone(job); break;
  }
}

async function proccessIntent (job)
{
  let price = job.qty > 0 ? quote.bidPrice : quote.askPrice;
  const order = orders.create(`${job.id}-in`, job.sym, job.qty, price);
  if (order) {
    updateJob(job, job.qty, price, STATES.ORDER, Date.now());
    bb.emit('OrderPlaced');
  } else {
    bb.emit('OrderFailed');
  }
}

async function proccessOrder (job)
{
  const order = orders.find(`${job.id}-in`);
  // TODO: handle missing order?

  if (Date.now() - job.t > cfg.broker.lifetime) {
    cancelOrder(order.clOrdID, 'Expired', job);
    return;
  }

  if (job.qty > 0) {
    let price = quote.bidPrice;

    if (price > candle.bb_ma - cfg.broker.min_profit) {
      cancelOrder(order.clOrdID, 'MA Crossed', job);
    } else if (order.price != price){
      amendOrder(order.clOrdID, price);
    }

  } else {
    let price = quote.askPrice;

    if (price < candle.bb_ma + cfg.broker.min_profit) {
      cancelOrder(order.clOrdID, 'MA Crossed', job);
    } else if (order.price != price){
      amendOrder(order.clOrdID, price);
    }
  }
}

function proccessFilled (job)
{
  // Create sell order
  // Create stop-loss order
  // Move to Position state
}

function proccessPosition (job)
{
  // Check if the sell order needs to be amended
}

function proccessDone (job)
{
  // Take the job from the list & log
}

//== AUX

function genId ()
{
  return `ag-${Math.random().toString(36).substr(2, 8)}`;
}

function find (id)
{
  return jobs.find(j => j.id === id);
}

function setCandle (c)
{
  candle = c;
}

function setQuote (q)
{
  quote = q;
}

module.exports = {
  STATES: STATES,
  create: create,
  update: update,
  destroy: destroy,
  find: find,
  setQuote: setQuote,
  setCandle: setCandle
};
